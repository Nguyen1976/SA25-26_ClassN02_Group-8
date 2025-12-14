import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { LoginUserDto, RegisterUserDto } from './dto/user.dto'
import {
  MakeFriendRequest,
  MakeFriendResponse,
  UpdateStatusResponse,
  USER_GRPC_SERVICE_NAME,
  UserGrpcServiceClient,
  UserLoginRequest,
  UserLoginResponse,
  UserRegisterRequest,
  UserRegisterResponse,
} from 'interfaces/user.grpc'
import type { ClientGrpc } from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'
import { RealtimeGateway } from '../realtime/realtime.gateway'
import { FriendRequestStatus } from 'interfaces/user'
import { NotificationService } from '../notification/notification.service'
import { ChatService } from '../chat/chat.service'
import { NotificationType } from 'interfaces/notification'
import { SOCKET_EVENTS } from 'libs/constant/socket.events'

@Injectable()
export class UserService implements OnModuleInit {
  private userClientService: UserGrpcServiceClient
  constructor(
    @Inject(USER_GRPC_SERVICE_NAME) private userClient: ClientGrpc,
    @Inject(RealtimeGateway) private realtimeGateway: RealtimeGateway,
    @Inject(NotificationService)
    private notificationService: NotificationService,
    @Inject(ChatService) private chatService: ChatService,
  ) {}

  onModuleInit() {
    this.userClientService = this.userClient.getService<UserGrpcServiceClient>(
      USER_GRPC_SERVICE_NAME,
    )
  }

  async register(dto: RegisterUserDto): Promise<UserRegisterResponse> {
    let observable = this.userClientService.register({
      email: dto.email,
      password: dto.password,
      username: dto.username,
    } as UserRegisterRequest)
    return await firstValueFrom(observable)
  }
  async login(dto: LoginUserDto): Promise<UserLoginResponse> {
    let observable = this.userClientService.login({
      email: dto.email,
      password: dto.password,
    } as UserLoginRequest)

    return await firstValueFrom(observable)
  }

  async makeFriend(dto: any): Promise<any> {
    //tạo bạn ghi trong user service
    const observable = this.userClientService.makeFriend({
      inviterId: dto.inviterId,
      inviterName: dto.inviterName,
      inviteeEmail: dto.inviteeEmail,
    } as MakeFriendRequest)

    const res: MakeFriendResponse = await firstValueFrom(observable)
    //check online and create notification
    if (res.inviteeStatus) {
      let createdNotification =
        await this.notificationService.createNotification({
          inviterId: dto.inviterId,
          inviteeName: res.inviteeName,
          message: `You have a new friend request to ${res.inviteeName}.`,
          type: NotificationType.FRIEND_REQUEST,
        })
      this.realtimeGateway.emitToUser(
        [res.inviteeId],
        SOCKET_EVENTS.USER.NEW_FRIEND_REQUEST,
        createdNotification,
      )
    }
    return { status: 'SUCCESS' }
  }

  async updateStatusMakeFriend(dto: any): Promise<UpdateStatusResponse> {
    const inviterStatus = await this.realtimeGateway.checkUserOnline(
      dto.inviterId,
    )
    const observable = this.userClientService.updateStatusMakeFriend({
      status: dto.status as FriendRequestStatus,
      inviteeId: dto.inviteeId,
      inviterId: dto.inviterId,
    })

    //xử lý tạo bản ghi notification r emit về
    let createdNotification = await this.notificationService.createNotification(
      {
        inviterId: dto.inviterId,
        inviteeName: dto.inviteeName,
        message: `Friend request to ${dto.inviteeName} has been ${dto.status.toLowerCase()}.`,
        type: NotificationType.NORMAL_NOTIFICATION,
      },
    )

    //xử lý tạo conversation rồi emit về
    let createdConversation = await this.chatService.createConversation({
      type: 'DIRECT',
      memberIds: [dto.inviterId, dto.inviteeId],
    })

    //ở đây sẽ xử lý socket
    if (inviterStatus) {
      this.realtimeGateway.emitToUser(
        [dto.inviterId],
        SOCKET_EVENTS.USER.UPDATE_FRIEND_REQUEST_STATUS,
        //trả về bản ghi thông báo luôn
        createdNotification,
      )
      if (dto.status === FriendRequestStatus.ACCEPT) {
        this.realtimeGateway.emitToUser(
          [dto.inviteeId, dto.inviterId],
          SOCKET_EVENTS.CHAT.NEW_CONVERSATION,
          createdConversation,
        )
      }
    }

    return await firstValueFrom(observable)
  }
}
