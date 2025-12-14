import { PrismaService } from '@app/prisma/prisma.service'
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { Inject, Injectable } from '@nestjs/common'
import { ConversationType } from 'interfaces/chat'
import {
  CreateConversationRequest,
  type CreateConversationResponse,
} from 'interfaces/chat.grpc'
import { FriendRequestStatus } from 'interfaces/user'

@Injectable()
export class ChatService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

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
}
