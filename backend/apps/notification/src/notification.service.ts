import { MailerService } from '@app/mailer'
import { PrismaService } from '@app/prisma'
import { UtilService } from '@app/util'
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { Inject, Injectable } from '@nestjs/common'
import { NotificationType, Status } from '@prisma/client'
import {
  GetNotificationsRequest,
  GetNotificationsResponse,
} from 'interfaces/notification.grpc'
import { Redis as RedisClient } from 'ioredis'
import { EXCHANGE_RMQ } from 'libs/constant/rmq/exchange'
import type {
  UserCreatedPayload,
  UserMakeFriendPayload,
  UserUpdateStatusMakeFriendPayload,
} from 'libs/constant/rmq/payload'
import { QUEUE_RMQ } from 'libs/constant/rmq/queue'
import { ROUTING_RMQ } from 'libs/constant/rmq/routing'

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
  async handleUserRegistered(data: UserCreatedPayload) {
    await this.mailerService.sendUserConfirmation(data)
    //tạo thông báo
  }

  @RabbitSubscribe({
    exchange: EXCHANGE_RMQ.USER_EVENTS,
    routingKey: ROUTING_RMQ.USER_MAKE_FRIEND,
    queue: QUEUE_RMQ.NOTIFICATION_USER_MAKE_FRIEND,
  })
  async handleMakeFriend(data: UserMakeFriendPayload) {
    /**
     * 
     * inviterName: data.inviterName,
      inviteeEmail: data.inviteeEmail,
      inviteeName: friend.username,
      inviteeId: res.toUserId,
      inviterId: data.inviterId,

      friendRequestId: data.friendRequestId,
     */
    //vấn đề gặp phải đó là phải có inviteeId
    let inviteeStatus = await this.checkUserOnline(data.inviteeId)

    const notificationCreated = await this.createNotification({
      userId: data.inviteeId,
      message: `${data.inviterName} đã gửi lời mời kết bạn cho bạn.`,
      type: NotificationType.FRIEND_REQUEST,
      friendRequestId: data.friendRequestId,
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
  }

  @RabbitSubscribe({
    exchange: EXCHANGE_RMQ.USER_EVENTS,
    routingKey: ROUTING_RMQ.USER_UPDATE_STATUS_MAKE_FRIEND,
    queue: QUEUE_RMQ.NOTIFICATION_USER_UPDATE_STATUS_MAKE_FRIEND,
  })
  async handleUpdateStatusMakeFriend(data: UserUpdateStatusMakeFriendPayload) {
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
        friendRequestId: data.friendRequestId || null,
      },
    })
    return {
      ...res,
      createdAt: res.createdAt.toString(),
    } as unknown
  }

  async getNotifications(
    data: GetNotificationsRequest,
  ): Promise<GetNotificationsResponse> {
    const { userId, page, limit } = data

    const take = Number(limit) || 5
    const skip = ((Number(page) || 1) - 1) * take

    const notifications = await this.prisma.notification.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: take,
    })

    return {
      notifications: notifications.map((n) => ({
        ...n,
        createdAt: n.createdAt.toString(),
      })),
    } as GetNotificationsResponse
  }
}
