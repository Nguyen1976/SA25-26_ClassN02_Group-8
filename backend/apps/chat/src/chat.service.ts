import { UtilService } from '@app/util'
import { Inject, Injectable } from '@nestjs/common'
import { conversationType, Status } from '@prisma/client'
import {
  AddMemberToConversationRequest,
  type AddMemberToConversationResponse,
  CreateConversationRequest,
  GetMessagesResponse,
  ReadMessageRequest,
  ReadMessageResponse,
  SendMessageRequest,
  SendMessageResponse,
} from 'interfaces/chat.grpc'
import type {
  UserUpdatedPayload,
  UserUpdateStatusMakeFriendPayload,
} from 'libs/constant/rmq/payload'
import {
  ConversationRepository,
  MessageRepository,
  ConversationMemberRepository,
} from './repositories'
import { ChatErrors } from './errors/chat.errors'
import { ChatEventsPublisher } from './rmq/publishers/chat-events.publisher'

@Injectable()
export class ChatService {
  constructor(
    private readonly conversationRepo: ConversationRepository,
    private readonly messageRepo: MessageRepository,
    private readonly memberRepo: ConversationMemberRepository,
    private readonly eventsPublisher: ChatEventsPublisher,
  ) {}

  async createConversationWhenAcceptFriend(
    data: UserUpdateStatusMakeFriendPayload,
  ) {
    if (!(data.status === Status.ACCEPTED)) return
    await this.createConversation({
      type: conversationType.DIRECT,
      members: data.members,
    })
  }

  async createConversation(data: CreateConversationRequest) {
    const memberIds = data.members
      .map((m) => m.userId)
      .filter((id) => id !== data.createrId)
    //trường hợp tạo nhóm
    if (data.createrId && memberIds.length <= 1) {
      ChatErrors.conversationNotEnoughMembers()
    }
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

    this.eventsPublisher.publishConversationCreated({
      ...res,
      memberIds,
    })

    return res
  }

  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    const conversationMembers = await this.memberRepo.findByConversationId(
      data.conversationId,
    )
    const memberIds = conversationMembers.map((cm) => cm.userId)

    if (!memberIds.includes(data.senderId)) {
      ChatErrors.senderNotMember()
    }

    const message = await this.messageRepo.create({
      conversationId: data.conversationId,
      senderId: data.senderId,
      text: data.message,
      replyToMessageId: data.replyToMessageId,
    })

    await this.conversationRepo.updateUpdatedAt(data.conversationId)

    this.eventsPublisher.publishMessageSent(message, memberIds as string[])

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
      ChatErrors.conversationNotFound()
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

    this.eventsPublisher.publishMemberAddedToConversation({
      conversationId: dto.conversationId,
      newMemberIds,
    })

    return {
      status: 'SUCCESS',
    }
  }

  async getConversations(userId: string, params: any) {
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
      conversations,
      unreadMap,
    }
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
      ChatErrors.userNotMember()
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
      ChatErrors.invalidLastReadMessage()
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
