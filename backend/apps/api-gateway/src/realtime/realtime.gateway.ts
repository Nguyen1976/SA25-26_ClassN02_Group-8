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
import { SOCKET_EVENTS } from 'libs/constant/socket.events'
import type { SendMessagePayload } from 'libs/constant/socket.payload'

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
      /**
       * {
        userId: '693befebbeed61ee46291bf3',
        email: 'nguyen2202794@gmail.com',
        username: 'nguyen11',
        iat: 1765553456,
        exp: 1765557056
      }
       */
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
  async handleSendMessage(
    @MessageBody() data: SendMessagePayload,
    @ConnectedSocket() client: Socket,
  ) {
    //gọi chat service để lưu tin nhắn
    //định dạng dữ liệu cần

    /**
     * conversationId: string
     * senderId: string (client.data.userId) k cần truyền từ FE
     * replyToMessageId?: string nếu k có thì đơn giản là hiển thị tin nhắn bthg
     * thằng chat service sẽ thực hiện hành động emit
     */

    //call chat service ....
    let res = await this.chatService.sendMessage({
      conversationId: data.conversationId,
      senderId: client.data.userId,
      message: data.message,
      replyToMessageId: data.replyToMessageId || '',
    })
    /**
       * Message saved: {
          conversationId: '693e6e395030dd62ac2181dc',
          senderId: '693befebbeed61ee46291bf3',
          replyToMessageId: '',
          message: 'Xin chào, rất vui được làm quen',
          createdAt: {
            seconds: Long { low: 1765703286, high: 0, unsigned: false },
            nanos: 37000000
          }
        }
          data.memberIds
       */

    this.emitToUser(
      data.memberIds.filter(
        async (id: string) =>
          (await this.checkUserOnline(id)) && id !== res.senderId,
      ),
      SOCKET_EVENTS.CHAT.NEW_MESSAGE,
      res,
    )
    //trong tương lai trong redis có thể quản lý thêm các conversation map với user đang online để giảm số lần query xuoogns db
  }
}
