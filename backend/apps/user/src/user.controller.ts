import { Controller } from '@nestjs/common'
import { UserService } from './user.service'
import { GrpcMethod } from '@nestjs/microservices'
import type { Metadata } from '@grpc/grpc-js'
import {
  type ListFriendsRequest,
  USER_GRPC_SERVICE_NAME,
  type MakeFriendRequest,
  type MakeFriendResponse,
  type UpdateStatusRequest,
  type UpdateStatusResponse,
  type UserGrpcServiceController,
  type UserRegisterRequest,
  type UserRegisterResponse,
  type UpdateProfileRequest,
  type UpdateProfileResponse,
  type GetUserByIdResponse,
  type GetUserByIdRequest,
  type UserLoginRequest,
  type UserLoginResponse,
  type DetailMakeFriendResponse,
} from 'interfaces/user.grpc'
import { UserMapper } from './domain/user.mapper'

@Controller()
export class UserController implements UserGrpcServiceController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod(USER_GRPC_SERVICE_NAME, 'register')
  async register(
    data: UserRegisterRequest,
    metadata: Metadata,
  ): Promise<UserRegisterResponse> {
    const user = await this.userService.register(data)
    return UserMapper.toRegisterResponse(user)
  }

  @GrpcMethod(USER_GRPC_SERVICE_NAME, 'login')
  async login(
    data: UserLoginRequest,
    metadata: Metadata,
  ): Promise<UserLoginResponse> {
    const session = await this.userService.login(data)
    return UserMapper.toLoginResponse(session)
  }

  @GrpcMethod(USER_GRPC_SERVICE_NAME, 'makeFriend')
  async makeFriend(
    data: MakeFriendRequest,
    metadata: Metadata,
  ): Promise<MakeFriendResponse> {
    const friendship = await this.userService.makeFriend(data)
    return UserMapper.toMakeFriendResponse(friendship)
  }

  @GrpcMethod(USER_GRPC_SERVICE_NAME, 'updateStatusMakeFriend')
  async updateStatusMakeFriend(
    data: UpdateStatusRequest,
    metadata: Metadata,
  ): Promise<UpdateStatusResponse> {
    const friendship = await this.userService.updateStatusMakeFriend(data)
    return UserMapper.toUpdateStatusResponse(friendship)
  }

  @GrpcMethod(USER_GRPC_SERVICE_NAME, 'listFriends')
  async listFriends(
    data: ListFriendsRequest,
    metadata: Metadata,
  ): Promise<any> {
    const friends = await this.userService.listFriends(data.userId)
    return UserMapper.toListFriendsResponse(friends)
  }

  @GrpcMethod(USER_GRPC_SERVICE_NAME, 'detailMakeFriend')
  async detailMakeFriend(
    data: { friendRequestId: string },
    metadata: Metadata,
  ): Promise<DetailMakeFriendResponse> {
    const friendRequest = await this.userService.detailMakeFriend(
      data.friendRequestId,
    )
    return UserMapper.toDetailMakeFriendResponse(friendRequest)
  }

  @GrpcMethod(USER_GRPC_SERVICE_NAME, 'updateProfile')
  async updateProfile(
    data: UpdateProfileRequest,
    metadata: Metadata,
  ): Promise<UpdateProfileResponse> {
    const profile = await this.userService.updateProfile(data)
    return UserMapper.toUpdateProfileResponse(profile)
  }

  @GrpcMethod(USER_GRPC_SERVICE_NAME, 'getUserById')
  async getUserById(
    data: GetUserByIdRequest,
    metadata: Metadata,
  ): Promise<GetUserByIdResponse> {
    const user = await this.userService.getUserById(data.userId)
    return UserMapper.toGetUserByIdResponse(user)
  }
}
