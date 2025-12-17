import { MailerService } from '@app/mailer'
import { PrismaService } from '@app/prisma'
import { UtilService } from '@app/util'
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { Inject, Injectable } from '@nestjs/common'
import { NotificationType, Status } from '@prisma/client'
import { Redis as RedisClient } from 'ioredis'
import { EXCHANGE_RMQ } from 'libs/constant/rmq/exchange'
import { QUEUE_RMQ } from 'libs/constant/rmq/queue'
import { ROUTING_RMQ } from 'libs/constant/rmq/routing'
import { SOCKET_EVENTS } from 'libs/constant/websocket/socket.events'

@Injectable()
export class NotificationService {
  @Inject(MailerService)
  private readonly mailerService: MailerService
  @Inject(PrismaService)
  private readonly prisma: PrismaService

  @Inject(UtilService)
  private readonly utilService: UtilService

  @Inject('USER_REDIS')
  private readonly redis: RedisClient
  constructor(private readonly amqpConnection: AmqpConnection) {}

  checkUserOnline = async (userId: string): Promise<boolean> => {
    const socketCount = await this.redis.scard(`user:${userId}:sockets`)
    return socketCount > 0
  }

  @RabbitSubscribe({
    exchange: EXCHANGE_RMQ.USER_EVENTS,
    routingKey: ROUTING_RMQ.USER_CREATED,
    queue: QUEUE_RMQ.NOTIFICATION_USER_CREATED,
  })
  async handleUserRegistered(data: any) {
    await this.mailerService.sendUserConfirmation(data)
    //tạo thông báo
  }

  @RabbitSubscribe({
    exchange: EXCHANGE_RMQ.USER_EVENTS,
    routingKey: ROUTING_RMQ.USER_MAKE_FRIEND,
    queue: QUEUE_RMQ.NOTIFICATION_USER_MAKE_FRIEND,
  })
  async handleMakeFriend(data: any) {
    /**
     * 
     * inviterName: data.inviterName,
      inviteeEmail: data.inviteeEmail,
      inviteeName: friend.username,
      inviteeId: res.toUserId,
      inviterId: data.inviterId,
     */
    //vấn đề gặp phải đó là phải có inviteeId
    let inviteeStatus = await this.checkUserOnline(data.inviteeId)

    const notificationCreated = await this.createNotification({
      userId: data.inviteeId,
      message: `${data.inviterName} đã gửi lời mời kết bạn cho bạn.`,
      type: NotificationType.FRIEND_REQUEST,
    })

    if (!inviteeStatus) {
      //nếu offline thì gửi mail
      await this.mailerService.sendMakeFriendNotification({
        senderName: data.inviterName,
        friendEmail: data.inviteeEmail,
        receiverName: data.inviteeName,
      })
    } else {
      //bắn socket
      this.amqpConnection.publish(
        EXCHANGE_RMQ.NOTIFICATION_EVENTS,
        ROUTING_RMQ.NOTIFICATION_CREATED,
        notificationCreated,
      )
    }

    return
  }

  @RabbitSubscribe({
    exchange: EXCHANGE_RMQ.USER_EVENTS,
    routingKey: ROUTING_RMQ.USER_UPDATE_STATUS_MAKE_FRIEND,
    queue: QUEUE_RMQ.NOTIFICATION_USER_UPDATE_STATUS_MAKE_FRIEND,
  })
  async handleUpdateStatusMakeFriend(data: any) {
    /**
     * inviterId: data.inviterId,//ngươi nhận thông báo
      inviteeName: data.inviteeName,
      status: data.status,
     * 
     * 
     */
    //xử lý tạo bản ghi notification r emit về
    let createdNotification = await this.createNotification({
      userId: data.inviterId,
      message: `Lời mời kết bạn của ${data.inviteeName} đã được ${
        data.status === Status.ACCEPTED ? 'chấp nhận' : 'từ chối'
      }.`,
      type: NotificationType.NORMAL_NOTIFICATION,
    })
    const inviterStatus = await this.checkUserOnline(data.inviterId)

    if (inviterStatus) {
      this.amqpConnection.publish(
        EXCHANGE_RMQ.NOTIFICATION_EVENTS,
        ROUTING_RMQ.NOTIFICATION_CREATED,
        createdNotification,
      )
    } else {
      //offline thì gửi mail (later)
    }

    return
  }

  async createNotification(data: any) {
    const res = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        message: data.message,
        type: data.type as NotificationType,
      },
    })
    return {
      id: res.id,
      userId: res.userId,
      message: res.message,
      isRead: res.isRead,
      type: res.type,
      createdAt: this.utilService.dateToTimestamp(res.createdAt),
    } as unknown
  }
}
