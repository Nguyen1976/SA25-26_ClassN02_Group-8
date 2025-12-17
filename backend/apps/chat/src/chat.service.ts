import { PrismaService } from '@app/prisma/prisma.service'
import { UtilService } from '@app/util'
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { Inject, Injectable } from '@nestjs/common'
import { conversationType, Status } from '@prisma/client'
import {
  CreateConversationRequest,
  type CreateConversationResponse,
} from 'interfaces/chat.grpc'
import { EXCHANGE_RMQ } from 'libs/constant/rmq/exchange'
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
  async createConversationWhenAcceptFriend(data: any) {
    // inviterId: data.inviterId,//ngươi nhận thông báo
    // inviteeName: data.inviteeName,
    // status: data.status,

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

    return {
      id: conversation.id,
      type: conversation.type,
      groupName: conversation.groupName || '',
      groupAvatar: conversation.groupAvatar || '',
      memberIds: data.memberIds,
      adminId: data.type === conversationType.GROUP ? data.createrId : '',
    } as CreateConversationResponse
  }

  @RabbitSubscribe({
    exchange: EXCHANGE_RMQ.CHAT_EVENTS,
    routingKey: ROUTING_RMQ.MESSAGE_SEND,
    queue: QUEUE_RMQ.CHAT_MESSAGES_SEND,
  })
  async sendMessage(data): Promise<void> {
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
      throw new Error('Sender is not a member of the conversation')
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
}
