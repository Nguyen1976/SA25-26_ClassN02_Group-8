import { PrismaService } from '@app/prisma/prisma.service'
import { Inject, Injectable } from '@nestjs/common'
import { conversationType } from '@prisma/client'

@Injectable()
export class ConversationRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async create(data: {
    type: conversationType
    groupName?: string
    groupAvatar?: string
  }) {
    return await this.prisma.conversation.create({
      data: {
        type: data.type,
        groupName: data.groupName || null,
        groupAvatar: data.groupAvatar || null,
      },
    })
  }

  async findById(id: string) {
    return await this.prisma.conversation.findUnique({
      where: { id },
    })
  }

  async findByIdWithMembers(id: string) {
    return await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            userId: true,
            username: true,
            avatar: true,
            lastReadAt: true,
            fullName: true,
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
                fullName: true,
              },
            },
          },
        },
      },
    })
  }

  async findByUserIdPaginated(userId: string, skip: number, take: number) {
    return await this.prisma.conversation.findMany({
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
            fullName: true,
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
                fullName: true,
                avatar: true,
              },
            },
          },
        },
      },
    })
  }

  async updateUpdatedAt(conversationId: string) {
    return await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })
  }
}
