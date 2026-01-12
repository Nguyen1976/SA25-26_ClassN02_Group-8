import { PrismaService } from '@app/prisma/prisma.service'
import { Inject, Injectable } from '@nestjs/common'
import { conversationType } from '@prisma/client'
import { Member } from 'interfaces/chat.grpc'

@Injectable()
export class ConversationMemberRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async createMany(
    conversationId: string,
    members: Member[],
    createrId: string,
    type: conversationType,
  ) {
    return await this.prisma.conversationMember.createMany({
      data: members.map((member: Member) => ({
        ...member,
        conversationId,
        userId: member.userId,
        role:
          type === conversationType.GROUP && createrId === member.userId
            ? 'admin'
            : 'member',
        lastReadMessageId: null,
      })),
    })
  }

  async findByConversationId(conversationId: string) {
    return await this.prisma.conversationMember.findMany({
      where: {
        conversationId,
      },
      select: {
        userId: true,
      },
    })
  }

  async findByConversationIdAndUserIds(
    conversationId: string,
    userIds: string[],
  ) {
    return await this.prisma.conversationMember.findMany({
      where: {
        conversationId,
        userId: { in: userIds },
      },
      select: { userId: true },
    })
  }

  async findByConversationIdAndUserId(conversationId: string, userId: string) {
    return await this.prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId,
      },
    })
  }

  async addMembers(conversationId: string, memberIds: string[]) {
    return await this.prisma.conversationMember.createMany({
      data: memberIds.map((memberId) => ({
        conversationId,
        userId: memberId,
        role: 'member',
      })),
    })
  }

  async updateLastRead(
    conversationId: string,
    userId: string,
    lastReadMessageId: string,
  ) {
    return await this.prisma.conversationMember.updateMany({
      where: {
        conversationId,
        userId,
      },
      data: {
        lastReadAt: new Date(),
        lastReadMessageId,
      },
    })
  }

  async updateByUserId(
    userId: string,
    data: {
      avatar?: string
      fullName?: string
    },
  ) {
    return await this.prisma.conversationMember.updateMany({
      where: {
        userId,
      },
      data: {
        ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
        ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
      },
    })
  }
}
