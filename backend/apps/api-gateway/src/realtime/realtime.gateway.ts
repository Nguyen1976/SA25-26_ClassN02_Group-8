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

//nếu k đặt tên cổng thì nó sẽ trùng với cổng của http
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

  constructor(private jwtService: JwtService) {}
  //default function
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.query.token
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
      console.log(`✅ User ${payload.userId} connected`)
      client.data.userId = payload.userId
      UserStatusStore.addConnection(payload.userId, client.id)

      this.server.emit('user_online', { userId: payload.userId })
    } catch (error) {
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId
    if (!userId) return
    UserStatusStore.removeConnection(userId, client.id)
    if (!UserStatusStore.isOnline(userId)) {
      console.log(`❌ User ${userId} offline`)
      this.server.emit('user_offline', { userId })
    }
  }

  emitToUser(userId: string, event: string, data: any) {
    const sockets = UserStatusStore.getUserSockets(userId)
    sockets.forEach((socketId) => {
      this.server.to(socketId).emit(event, data)
    })
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    console.log('Message received:', payload)
    return 'Hello world!'
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    console.log('Received:', data)
    return { event: 'pong', data: 'hello from gateway' }
  }
}
