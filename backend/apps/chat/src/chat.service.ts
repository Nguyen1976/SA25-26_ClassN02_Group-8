import { UtilService } from '@app/util'
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { status } from '@grpc/grpc-js'
import { Inject, Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { conversationType, Status } from '@prisma/client'
import {
  AddMemberToConversationRequest,
  type AddMemberToConversationResponse,
  CreateConversationRequest,
  type CreateConversationResponse,
  type GetConversationsResponse,
  GetMessagesResponse,
  ReadMessageRequest,
  ReadMessageResponse,
  SendMessageRequest,
  SendMessageResponse,
} from 'interfaces/chat.grpc'
import { EXCHANGE_RMQ } from 'libs/constant/rmq/exchange'
import type {
  MemberAddedToConversationPayload,
  UserUpdatedPayload,
  UserUpdateStatusMakeFriendPayload,
} from 'libs/constant/rmq/payload'
import { ROUTING_RMQ } from 'libs/constant/rmq/routing'
import {
  ConversationRepository,
  MessageRepository,
  ConversationMemberRepository,
} from './repositories'

@Injectable()
export class ChatService {
  constructor(
    private readonly conversationRepo: ConversationRepository,
    private readonly messageRepo: MessageRepository,
    private readonly memberRepo: ConversationMemberRepository,
    @Inject(UtilService)
    private readonly utilService: UtilService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async createConversationWhenAcceptFriend(
    data: UserUpdateStatusMakeFriendPayload,
  ) {
    if (!(data.status === Status.ACCEPTED)) return
    const conversation = await this.createConversation({
      type: conversationType.DIRECT,
      members: data.members,
      createrId: data.inviterId,
    })

    this.amqpConnection.publish(
      EXCHANGE_RMQ.CHAT_EVENTS,
      ROUTING_RMQ.CONVERSATION_CREATED,
      conversation,
    )
  }

  async createConversation(
    data: CreateConversationRequest,
  ): Promise<CreateConversationResponse> {
    const conversation = await this.conversationRepo.create({
      type: data.type as conversationType,
      groupName: data.groupName,
      groupAvatar: data.groupAvatar,
    })

    await this.memberRepo.createMany(
      conversation.id,
      data.members,
      data.createrId as string,
      data.type as conversationType,
    )

    const res = await this.conversationRepo.findByIdWithMembers(conversation.id)

    return this.formatConversationResponse(res)
  }

  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    const conversationMembers = await this.memberRepo.findByConversationId(
      data.conversationId,
    )
    const memberIds = conversationMembers.map((cm) => cm.userId)

    if (!memberIds.includes(data.senderId)) {
      throw new RpcException({
        code: status.FAILED_PRECONDITION,
        message: 'Sender is not a member of the conversation',
      })
    }

    const message = await this.messageRepo.create({
      conversationId: data.conversationId,
      senderId: data.senderId,
      text: data.message,
      replyToMessageId: data.replyToMessageId,
    })

    await this.conversationRepo.updateUpdatedAt(data.conversationId)

    this.amqpConnection.publish(
      EXCHANGE_RMQ.CHAT_EVENTS,
      ROUTING_RMQ.MESSAGE_SENT,
      {
        ...message,
        memberIds,
      },
    )

    return {
      message: {
        ...message,
        createdAt: message.createdAt.toString(),
      },
    } as SendMessageResponse
  }

  async addMemberToConversation(
    dto: AddMemberToConversationRequest,
  ): Promise<AddMemberToConversationResponse> {
    const conversation = await this.conversationRepo.findById(
      dto.conversationId,
    )

    if (!conversation) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Conversation not found',
      })
    }

    const existingMembers =
      await this.memberRepo.findByConversationIdAndUserIds(
        dto.conversationId,
        dto.memberIds,
      )

    const existingMemberIds = existingMembers.map((m) => m.userId)
    const newMemberIds = dto.memberIds.filter(
      (id) => !existingMemberIds.includes(id),
    )

    if (newMemberIds.length === 0) {
      return {
        status: 'Member already in conversation',
      }
    }

    await this.memberRepo.addMembers(dto.conversationId, newMemberIds)

    const payload: MemberAddedToConversationPayload = {
      conversationId: dto.conversationId,
      newMemberIds,
    }

    this.amqpConnection.publish(
      EXCHANGE_RMQ.CHAT_EVENTS,
      ROUTING_RMQ.MEMBER_ADDED_TO_CONVERSATION,
      payload,
    )

    return {
      status: 'SUCCESS',
    }
  }

  async getConversations(
    userId: string,
    params: any,
  ): Promise<GetConversationsResponse> {
    const take = Number(params.limit) || 20
    const page = Number(params.page) || 1
    const skip = (page - 1) * take

    const conversations = await this.conversationRepo.findByUserIdPaginated(
      userId,
      skip,
      take,
    )

    const unreadMap = await this.calculateUnreadCounts(conversations, userId)

    return {
      conversations: conversations.map((c) => ({
        id: c.id,
        type: c.type,
        groupName: c.groupName,
        groupAvatar: c.groupAvatar,
        unreadCount: unreadMap.get(c.id) ?? '0',
        createdAt: c.createdAt.toString(),
        updatedAt: c.updatedAt.toString(),
        members: c.members.map((m) => ({
          userId: m.userId,
          username: m.username,
          avatar: m.avatar,
          fullName: m.fullName,
          lastReadAt: m.lastReadAt ? m.lastReadAt.toString() : null,
        })),
        lastMessage: c.messages.length
          ? {
              ...c.messages[0],
              createdAt: c.messages[0].createdAt.toString(),
            }
          : null,
      })),
    } as GetConversationsResponse
  }

  async getMessagesByConversationId(
    conversationId: string,
    userId: string,
    params: any,
  ): Promise<GetMessagesResponse> {
    const isMember = await this.memberRepo.findByConversationIdAndUserId(
      conversationId,
      userId,
    )

    if (!isMember) {
      throw new RpcException({
        code: status.FAILED_PRECONDITION,
        message: 'User is not a member of the conversation',
      })
    }

    const take = params.limit || 20
    const page = params.page || 1
    const skip = (page - 1) * take

    const messages = await this.messageRepo.findByConversationIdPaginated(
      conversationId,
      skip,
      parseInt(take),
    )

    return {
      messages: messages.map((m) => ({
        ...m,
        createdAt: m.createdAt.toString(),
      })),
    } as GetMessagesResponse
  }

  async readMessage(data: ReadMessageRequest): Promise<ReadMessageResponse> {
    const message = await this.messageRepo.findById(
      data.lastReadMessageId,
      data.conversationId,
    )

    if (!message) {
      throw new RpcException({
        code: status.FAILED_PRECONDITION,
        message: 'lastReadMessageId does not belong to the conversation',
      })
    }

    await this.memberRepo.updateLastRead(
      data.conversationId,
      data.userId,
      data.lastReadMessageId,
    )

    return { lastReadMessageId: data.lastReadMessageId }
  }

  async handleUserUpdated(data: UserUpdatedPayload) {
    await this.memberRepo.updateByUserId(data.userId, {
      avatar: data.avatar,
      fullName: data.fullName,
    })
  }

  // Private helper methods
  private formatConversationResponse(res: any): CreateConversationResponse {
    return {
      conversation: {
        id: res?.id,
        unreadCount: '0',
        type: res?.type,
        groupName: res?.groupName,
        groupAvatar: res?.groupAvatar,
        createdAt: res?.createdAt.toString(),
        updatedAt: res?.updatedAt.toString(),
        members: res?.members.map((m: any) => ({
          ...m,
          lastReadAt: m.lastReadAt ? m.lastReadAt.toString() : '',
        })),
        messages:
          res?.messages?.map((msg: any) => ({
            ...msg,
            createdAt: msg.createdAt.toString(),
          })) || [],
      },
    } as CreateConversationResponse
  }

  private async calculateUnreadCounts(
    conversations: any[],
    userId: string,
  ): Promise<Map<string, string>> {
    const unreadMap = new Map<string, string>()

    await Promise.all(
      conversations.map(async (c) => {
        const me = c.members.find((m: any) => m.userId === userId)
        const lastReadAt = me?.lastReadAt ?? null

        const unreadMessages = await this.messageRepo.findUnreadMessages(
          c.id,
          lastReadAt,
          userId,
        )

        if (unreadMessages.length === 0) {
          unreadMap.set(c.id, '0')
        } else if (unreadMessages.length <= 5) {
          unreadMap.set(c.id, String(unreadMessages.length))
        } else {
          unreadMap.set(c.id, '5+')
        }
      }),
    )

    return unreadMap
  }
}
