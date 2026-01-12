import { PrismaService } from '@app/prisma/prisma.service'
import { Inject, Injectable } from '@nestjs/common'

@Injectable()
export class MessageRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async create(data: {
    conversationId: string
    senderId: string
    text: string
    replyToMessageId?: string | null
  }) {
    return await this.prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderId: data.senderId,
        text: data.text,
        replyToMessageId: data.replyToMessageId || null,
      },
      include: {
        senderMember: {
          select: {
            userId: true,
            username: true,
            avatar: true,
            role: true,
            lastReadAt: true,
            fullName: true,
          },
        },
      },
    })
  }

  async findById(id: string, conversationId: string) {
    return await this.prisma.message.findFirst({
      where: {
        id,
        conversationId,
      },
    })
  }

  async findByConversationIdPaginated(
    conversationId: string,
    skip: number,
    take: number,
  ) {
    return await this.prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        senderMember: {
          select: {
            userId: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    })
  }

  async findUnreadMessages(
    conversationId: string,
    lastReadAt: Date | null,
    userId: string,
  ) {
    return await this.prisma.message.findMany({
      where: {
        conversationId,
        ...(lastReadAt && {
          createdAt: { gt: lastReadAt },
        }),
        isDeleted: false,
        NOT: { senderId: userId },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true },
    })
  }
}
