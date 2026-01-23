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
import { JwtService } from '@nestjs/jwt'
import { Inject, Injectable } from '@nestjs/common'
import { SOCKET_EVENTS } from 'libs/constant/websocket/socket.events'
import type { SendMessagePayloadSocket } from 'libs/constant/websocket/socket.payload'
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { EXCHANGE_RMQ } from 'libs/constant/rmq/exchange'
import { QUEUE_RMQ } from 'libs/constant/rmq/queue'
import { ROUTING_RMQ } from 'libs/constant/rmq/routing'
import type { MemberAddedToConversationPayload } from 'libs/constant/rmq/payload'
import { UserStatusStore } from './user-status.store'

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
    private redisClient: any
  ) {
    this.userStatusStore = new UserStatusStore(this.redisClient)
  }

  //default function
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token
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
  async emitNewConversationToUser(conversation): Promise<void> {
    await this.emitToUser(
      conversation.members.map((m) => m.userId) as string[],
      SOCKET_EVENTS.CHAT.NEW_CONVERSATION,
      { conversation },
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
    return { event: 'pong', data: 'hello from gateway' }
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

  @RabbitSubscribe({
    exchange: EXCHANGE_RMQ.CHAT_EVENTS,
    routingKey: ROUTING_RMQ.MEMBER_ADDED_TO_CONVERSATION,
    queue: QUEUE_RMQ.REALTIME_MEMBERS_ADDED_TO_CONVERSATION,
  })
  async handleNewMemberAddedToConversation(
    data: MemberAddedToConversationPayload,
  ): Promise<void> {
    await this.emitToUser(
      data.newMemberIds,
      SOCKET_EVENTS.CHAT.NEW_MEMBER_ADDED,
      data.conversationId,
    )
  }
}
