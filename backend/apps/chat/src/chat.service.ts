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
  Member,
  ReadMessageRequest,
  ReadMessageResponse,
  SendMessageRequest,
  SendMessageResponse,
} from 'interfaces/chat.grpc'
import { EXCHANGE_RMQ } from 'libs/constant/rmq/exchange'
import type {
  MemberAddedToConversationPayload,
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
    const conversation = await this.prisma.conversation.create({
      data: {
        type: data.type as conversationType,
        groupName: data.groupName || null,
        groupAvatar: data.groupAvatar || null,
      },
    })

    //ở lần sau sẽ tối ưu bằng transaction
    await this.prisma.conversationMember.createMany({
      data: data.members.map((member: Member) => ({
        ...member,
        conversationId: conversation.id,
        userId: member.userId,
        role:
          data.type === conversationType.GROUP &&
          data.createrId === member.userId
            ? 'admin'
            : 'member',
        lastReadMessageId: null,
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

  // @RabbitSubscribe({
  //   exchange: EXCHANGE_RMQ.CHAT_EVENTS,
  //   routingKey: ROUTING_RMQ.MESSAGE_SEND,
  //   queue: QUEUE_RMQ.CHAT_MESSAGES_SEND,
  // })
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
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
        replyToMessageId: data?.replyToMessageId || null,
      },
      include: {
        senderMember: {
          select: {
            userId: true,
            username: true,
            avatar: true,
            role: true,
            lastReadAt: true,
          },
        },
      },
    })

    //update conversation updatedAt
    await this.prisma.conversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() },
    })

    await this.amqpConnection.publish(
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
    const take = Number(params.limit) || 20
    const page = Number(params.page) || 1
    const skip = (page - 1) * take

    const conversations = await this.prisma.conversation.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take,
      include: {
        members: {
          select: {
            userId: true,
            username: true,
            avatar: true,
            lastReadAt: true,
            lastReadMessageId: true,
          },
        },
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

    const readAtMap = new Map<string, Date | null>()

    for (const c of conversations) {
      const me = c.members.find((m) => m.userId === userId)
      readAtMap.set(c.id, me?.lastReadAt ?? null)
    }

    type UnreadCount = string
    const unreadMap = new Map<string, UnreadCount>()

    await Promise.all(
      conversations.map(async (c) => {
        const lastReadAt = readAtMap.get(c.id)

        const unreadMessages = await this.prisma.message.findMany({
          where: {
            conversationId: c.id,
            ...(lastReadAt && {
              createdAt: { gt: lastReadAt },
            }),
            isDeleted: false,
          },
          orderBy: { createdAt: 'desc' },
          take: 6,
          select: { id: true },
        })

        if (unreadMessages.length === 0) {
          unreadMap.set(c.id, '0')
        } else if (unreadMessages.length <= 5) {
          unreadMap.set(c.id, String(unreadMessages.length))
        } else {
          unreadMap.set(c.id, '5+')
        }
      }),
    )

    return {
      conversations: conversations.map((c) => {
        const unreadCount = unreadMap.get(c.id) ?? 0

        return {
          id: c.id,
          type: c.type,
          groupName: c.groupName,
          groupAvatar: c.groupAvatar,
          unreadCount,
          createdAt: c.createdAt.toString(),
          updatedAt: c.updatedAt.toString(),
          members: c.members.map((m) => ({
            userId: m.userId,
            username: m.username,
            avatar: m.avatar,
            lastReadAt: m.lastReadAt ? m.lastReadAt.toString() : null,
          })),
          lastMessage: c.messages.length
            ? {
                ...c.messages[0],
                createdAt: c.messages[0].createdAt.toString(),
              }
            : null,
        }
      }),
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

  async readMessage(data: ReadMessageRequest): Promise<ReadMessageResponse> {
    const message = await this.prisma.message.findFirst({
      where: {
        id: data.lastReadMessageId,
        conversationId: data.conversationId,
      },
    })

    if (!message) {
      throw new RpcException({
        code: status.FAILED_PRECONDITION,
        message: 'lastReadMessageId does not belong to the conversation',
      })
    }
    await this.prisma.conversationMember.updateMany({
      where: {
        conversationId: data.conversationId,
        userId: data.userId,
      },
      data: {
        lastReadAt: new Date(),
        lastReadMessageId: data.lastReadMessageId,
      },
    })

    return { lastReadMessageId: data.lastReadMessageId }
  }
}
