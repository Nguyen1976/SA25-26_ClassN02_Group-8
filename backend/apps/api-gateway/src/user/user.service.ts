import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { LoginUserDto, MakeFriendDto, RegisterUserDto } from './dto/user.dto'
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
import { catchError, firstValueFrom, throwError } from 'rxjs'
import { RealtimeGateway } from '../realtime/realtime.gateway'
import { FriendRequestStatus } from 'interfaces/user'
import { NotificationService } from '../notification/notification.service'
import { ChatService } from '../chat/chat.service'

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

  async makeFriend(dto: any): Promise<MakeFriendResponse> {
    const observable = this.userClientService.makeFriend({
      senderId: dto.senderId,
      senderName: dto.username,
      friendEmail: dto.friendEmail,
    } as MakeFriendRequest)
    return await firstValueFrom(observable)
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
        status: dto.status,
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
        'update-friend-request-status',
        //trả về bản ghi thông báo luôn
        createdNotification,
      )
      if (dto.status === FriendRequestStatus.ACCEPT) {
        this.realtimeGateway.emitToUser(
          [dto.inviteeId, dto.inviterId],
          'new-conversation',
          createdConversation,
        )
      }
    }

    return await firstValueFrom(observable)
  }
}
