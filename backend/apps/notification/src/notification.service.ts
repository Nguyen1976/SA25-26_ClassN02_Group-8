import { MailerService } from '@app/mailer'
import { PrismaService } from '@app/prisma'
import { UtilService } from '@app/util'
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { Inject, Injectable } from '@nestjs/common'
import { createNotificationResponse } from 'interfaces/notification.grpc'
import { FriendRequestStatus } from 'interfaces/user'

@Injectable()
export class NotificationService {
  @Inject(MailerService)
  private readonly mailerService: MailerService
  @Inject(PrismaService)
  private readonly prisma: PrismaService

  @Inject(UtilService)
  private readonly utilService: UtilService

  @RabbitSubscribe({
    exchange: 'user.events',
    routingKey: 'user.created',
    queue: 'notification_queue',
  })
  async handleUserRegistered(data: any) {
    await this.mailerService.sendUserConfirmation(data)
  }

  @RabbitSubscribe({
    exchange: 'user.events',
    routingKey: 'user.makeFriend',
    queue: 'notification_queue',
  })
  async handleMakeFriend(data: any) {
    await this.mailerService.sendMakeFriendNotification(data)
  }

  async createNotification(data: any) {
    //kiểm tra nếu inviterStatus là online thì không gửi email
    // if (!data.inviterStatus) {
    //   // await this.mailerService.sendUpdateStatusMakeFriendNotification(data)
    // }
    //tạo bản ghi thông báo
    //k cần gửi mail nữa
    //  inviterId: data.inviterId,
    //     inviteeName: inventee ? inventee.username : '',
    //     status: data.status,
    let message = ''
    if (data.status === FriendRequestStatus.ACCEPT) {
      message = `Friend request to ${data.inviteeName} has been accepted.`
    } else {
      message = `Friend request to ${data.inviteeName} has been rejected.`
    }
    const res = await this.prisma.notification.create({
      data: {
        userId: data.inviterId,
        message,
      },
    })
    return {
      id: res.id,
      userId: res.userId,
      message: res.message,
      isRead: res.isRead,
      createdAt: this.utilService.dateToTimestamp(res.createdAt),
    } as unknown
  }
}
