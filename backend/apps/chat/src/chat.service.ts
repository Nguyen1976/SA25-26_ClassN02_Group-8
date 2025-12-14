import { PrismaService } from '@app/prisma/prisma.service'
import { UtilService } from '@app/util'
import { Inject, Injectable } from '@nestjs/common'
import { ConversationType } from 'interfaces/chat'
import {
  CreateConversationRequest,
  SendMessageRequest,
  SendMessageResponse,
  type CreateConversationResponse,
} from 'interfaces/chat.grpc'

@Injectable()
export class ChatService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(UtilService)
    private readonly utilService: UtilService,
  ) {}

  async createConversation(
    data: CreateConversationRequest,
  ): Promise<CreateConversationResponse> {
    const conversation = await this.prisma.conversation.create({
      data: {
        type: data.type as ConversationType,
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
          data.type === ConversationType.GROUP && data.createrId === memberId
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
      adminId: data.type === ConversationType.GROUP ? data.createrId : '',
    } as CreateConversationResponse
  }

  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    //tạo bản ghi tin nhắn
    const message = await this.prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderId: data.senderId,
        text: data.message,
        replyToMessageId: data.replyToMessageId || null,
      },
    })
    return {
      conversationId: message.conversationId,
      senderId: message.senderId,
      replyToMessageId: message.replyToMessageId || '',
      message: message.text,
      createdAt: this.utilService.dateToTimestamp(message.createdAt),
    } as SendMessageResponse
  }
}
