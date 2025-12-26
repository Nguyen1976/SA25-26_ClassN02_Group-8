import { PrismaService } from '@app/prisma/prisma.service'
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
} from 'interfaces/chat.grpc'
import { EXCHANGE_RMQ } from 'libs/constant/rmq/exchange'
import type {
  MemberAddedToConversationPayload,
  SendMessagePayload,
  UserUpdateStatusMakeFriendPayload,
} from 'libs/constant/rmq/payload'
import { QUEUE_RMQ } from 'libs/constant/rmq/queue'
import { ROUTING_RMQ } from 'libs/constant/rmq/routing'

@Injectable()
export class ChatService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(UtilService)
    private readonly utilService: UtilService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  @RabbitSubscribe({
    exchange: EXCHANGE_RMQ.USER_EVENTS,
    routingKey: ROUTING_RMQ.USER_UPDATE_STATUS_MAKE_FRIEND,
    queue: QUEUE_RMQ.CHAT_USER_UPDATE_STATUS_MAKE_FRIEND,
  })
  async createConversationWhenAcceptFriend(
    data: UserUpdateStatusMakeFriendPayload,
  ) {
    if (!(data.status === Status.ACCEPTED)) return
    const conversation = await this.createConversation({
      type: conversationType.DIRECT,
      memberIds: [data.inviterId, data.inviteeId],
      createrId: data.inviterId,
    })
    this.amqpConnection.publish(
      EXCHANGE_RMQ.CHAT_EVENTS,
      ROUTING_RMQ.CONVERSATION_CREATED,
      conversation,
    )

    return
  }

  async createConversation(
    data: CreateConversationRequest,
  ): Promise<CreateConversationResponse> {
    const conversation = await this.prisma.conversation.create({
      data: {
        type: data.type as conversationType,
        groupName: data.groupName || null,
        groupAvatar: data.groupAvatar || null,
      },
    })

    //ở lần sau sẽ tối ưu bằng transaction
    await this.prisma.conversationMember.createMany({
      data: data.memberIds.map((memberId) => ({
        conversationId: conversation.id,
        userId: memberId,
        role:
          data.type === conversationType.GROUP && data.createrId === memberId
            ? 'admin'
            : 'member',
      })),
    })

    const res = await this.prisma.conversation.findUnique({
      where: {
        id: conversation.id,
      },
      include: {
        members: {
          select: {
            userId: true,
            username: true,
            avatar: true,
            lastReadAt: true,
          },
        },

        // last message
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            text: true,
            senderId: true,
            createdAt: true,
            conversationId: true,
            replyToMessageId: true,
            isDeleted: true,
            deleteType: true,
            senderMember: {
              select: {
                userId: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    })
    console.log('Created conversation:', res)
    return {
      conversation: {
        id: res?.id,
        unreadCount: '0', //todo
        type: res?.type,
        groupName: res?.groupName,
        groupAvatar: res?.groupAvatar,
        createdAt: res?.createdAt.toString(),
        updatedAt: res?.updatedAt.toString(),
        members: res?.members.map((m) => ({
          ...m,
          lastReadAt: m.lastReadAt ? m.lastReadAt.toString() : '',
        })),
        messages:
          res?.messages?.map((msg) => ({
            ...msg,
            createdAt: msg.createdAt.toString(),
          })) || [],
      },
    } as CreateConversationResponse
  }

  @RabbitSubscribe({
    exchange: EXCHANGE_RMQ.CHAT_EVENTS,
    routingKey: ROUTING_RMQ.MESSAGE_SEND,
    queue: QUEUE_RMQ.CHAT_MESSAGES_SEND,
  })
  async sendMessage(data: SendMessagePayload): Promise<void> {
    //get memberIds của conversation để emit socket (sau này tối ưu bằng redis)
    const conversationMembers = await this.prisma.conversationMember.findMany({
      where: {
        conversationId: data.conversationId,
      },
      select: {
        userId: true,
      },
    })

    const memberIds = conversationMembers.map((cm) => cm.userId)

    if (!memberIds.includes(data.senderId)) {
      throw new RpcException({
        code: status.FAILED_PRECONDITION,
        message: 'Sender is not a member of the conversation',
      })
    }
    let message = await this.prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderId: data.senderId,
        text: data.message,
        replyToMessageId: data.replyToMessageId || null,
      },
    })

    await this.amqpConnection.publish(
      EXCHANGE_RMQ.CHAT_EVENTS,
      ROUTING_RMQ.MESSAGE_SENT,
      {
        ...message,
        memberIds,
      },
    )

    return
    // return {
    //   conversationId: message.conversationId,
    //   senderId: message.senderId,
    //   replyToMessageId: message.replyToMessageId || '',
    //   message: message.text,
    //   createdAt: this.utilService.dateToTimestamp(message.createdAt),
    // } as SendMessageResponse
  }

  async addMemberToConversation(
    dto: AddMemberToConversationRequest,
  ): Promise<AddMemberToConversationResponse> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: dto.conversationId },
    })

    if (!conversation) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Conversation not found',
      })
    }

    const existingMembers = await this.prisma.conversationMember.findMany({
      where: {
        conversationId: dto.conversationId,
        userId: { in: dto.memberIds },
      },
      select: { userId: true },
    })

    const existingMemberIds = existingMembers.map((m) => m.userId)

    const newMemberIds = dto.memberIds.filter(
      (id) => !existingMemberIds.includes(id),
    )
    //check memberIds đã có trong conversation chưa

    if (newMemberIds.length === 0) {
      return {
        status: 'Member already in conversation',
      }
    }
    await this.prisma.conversationMember.createMany({
      data: newMemberIds.map((memberId) => ({
        conversationId: dto.conversationId,
        userId: memberId,
        role: 'member',
      })),
    })

    //publish event user mới vào conversation
    //trả về conversation id fe tự fetch

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
    const take = params.limit || 20
    const page = params.page || 1
    const skip = (page - 1) * take

    const conversations = await this.prisma.conversation.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: parseInt(take),
      include: {
        members: {
          select: {
            userId: true,
            username: true,
            avatar: true,
            lastReadAt: true,
          },
        },

        // last message
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            text: true,
            senderId: true,
            createdAt: true,
            conversationId: true,
            replyToMessageId: true,
            isDeleted: true,
            deleteType: true,
            senderMember: {
              select: {
                userId: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    })

    return {
      conversations: conversations.map((c) => ({
        id: c.id,
        unreadCount: '0', //todo
        type: c.type,
        groupName: c.groupName,
        groupAvatar: c.groupAvatar,
        createdAt: c.createdAt.toString(),
        updatedAt: c.updatedAt.toString(),
        members: c.members.map((m) => ({
          ...m,
          lastReadAt: m.lastReadAt ? m.lastReadAt.toString() : '',
        })),
        messages: c.messages.map((msg) => ({
          ...msg,
          createdAt: msg.createdAt.toString(),
        })),
      })),
    } as GetConversationsResponse
  }

  async getMessagesByConversationId(
    conversationId: string,
    userId: string,
    params: any,
  ): Promise<any> {
    //check user is member of conversation
    const isMember = await this.prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId,
      },
    })
    if (!isMember) {
      throw new RpcException({
        code: status.FAILED_PRECONDITION,
        message: 'User is not a member of the conversation',
      })
    }
    const take = params.limit || 20
    const page = params.page || 1
    const skip = (page - 1) * take
    const messages = await this.prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(take),
      include: {
        senderMember: {
          select: {
            userId: true,
            username: true,
            avatar: true,
          },
        },
      },
    })

    return {
      messages: messages.map((m) => ({
        ...m,
        createdAt: m.createdAt.toString(),
      })),
    } as GetMessagesResponse
  }
}
