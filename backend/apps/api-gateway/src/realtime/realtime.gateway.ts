import { Server, Socket } from 'socket.io'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { UserStatusStore } from './user-status.store'
import { JwtService } from '@nestjs/jwt'
import { Inject, Injectable } from '@nestjs/common'
import { ChatService } from '../chat/chat.service'
import { SOCKET_EVENTS } from 'libs/constant/websocket/socket.events'
import type { SendMessagePayload } from 'libs/constant/websocket/socket.payload'
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { EXCHANGE_RMQ } from 'libs/constant/rmq/exchange'
import { QUEUE_RMQ } from 'libs/constant/rmq/queue'
import { ROUTING_RMQ } from 'libs/constant/rmq/routing'

//nếu k đặt tên cổng thì nó sẽ trùng với cổng của http
@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'realtime',
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server

  private userStatusStore: UserStatusStore
  constructor(
    private jwtService: JwtService,
    @Inject('REDIS_CLIENT')
    private redisClient: any,
    @Inject(ChatService)
    private chatService: ChatService,
  ) {
    this.userStatusStore = new UserStatusStore(this.redisClient)
  }

  //default function
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.query.token
      console.log(token)
      if (!token) {
        client.disconnect()
        return
      }
      const payload = this.jwtService.verify(token! as string)

      if (!payload.userId) {
        client.disconnect()
        return
      }
      client.data.userId = payload.userId
      await this.userStatusStore.addConnection(payload.userId, client.id)

      this.server.emit(SOCKET_EVENTS.CONNECTION, { userId: payload.userId })
    } catch (error) {
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId
    if (!userId) return
    this.userStatusStore.removeConnection(userId, client.id)
    if (!this.userStatusStore.isOnline(userId)) {
      console.log(`❌ User ${userId} offline`)
      this.server.emit(SOCKET_EVENTS.DISCONNECTION, { userId })
    }
  }

  @RabbitSubscribe({
    exchange: EXCHANGE_RMQ.NOTIFICATION_EVENTS,
    routingKey: ROUTING_RMQ.NOTIFICATION_CREATED,
    queue: QUEUE_RMQ.REALTIME_NOTIFICATIONS_CREATED,
  })
  async emitNotificationToUser(data): Promise<void> {
    await this.emitToUser(
      [data.userId],
      SOCKET_EVENTS.NOTIFICATION.NEW_NOTIFICATION,
      data,
    )
  }

  @RabbitSubscribe({
    exchange: EXCHANGE_RMQ.CHAT_EVENTS,
    routingKey: ROUTING_RMQ.CONVERSATION_CREATED,
    queue: QUEUE_RMQ.REALTIME_CONVERSATIONS_CREATED,
  })
  async emitNewConversationToUser(data): Promise<void> {
    await this.emitToUser(
      data.memberIds,
      SOCKET_EVENTS.CHAT.NEW_CONVERSATION,
      data,
    )
  }

  async emitToUser(userIds: string[], event: string, data: any) {
    for (const userId of userIds) {
      const sockets = (await this.userStatusStore.getUserSockets(
        userId,
      )) as string[]
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit(event, data)
      })
    }
  }

  async checkUserOnline(userId: string): Promise<boolean> {
    return this.userStatusStore.isOnline(userId)
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    console.log('Received:', data)
    return { event: 'pong', data: 'hello from gateway' }
  }

  @SubscribeMessage(SOCKET_EVENTS.CHAT.SEND_MESSAGE)
  handleSendMessage(
    @MessageBody() data: SendMessagePayload,
    @ConnectedSocket() client: Socket,
  ) {
    this.chatService.sendMessage({
      conversationId: data.conversationId,
      senderId: client.data.userId,
      message: data.message,
      replyToMessageId: data.replyToMessageId || '',
    })
    //trong tương lai trong redis có thể quản lý thêm các conversation map với user đang online để giảm số lần query xuoogns db
  }

  @RabbitSubscribe({
    exchange: EXCHANGE_RMQ.CHAT_EVENTS,
    routingKey: ROUTING_RMQ.MESSAGE_SENT,
    queue: QUEUE_RMQ.REALTIME_MESSAGES_SENT,
  })
  async handleNewMessageSent(data: any): Promise<void> {
    await this.emitToUser(
      data.memberIds.filter((id) => id !== data.senderId),
      SOCKET_EVENTS.CHAT.NEW_MESSAGE,
      data,
    )
  }
}
