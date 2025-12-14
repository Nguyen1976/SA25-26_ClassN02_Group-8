import { Controller, Inject } from '@nestjs/common'
import { UserService } from './user.service'
import { GrpcMethod, MessagePattern } from '@nestjs/microservices'
import type { Metadata, ServerUnaryCall } from '@grpc/grpc-js'
import {
  USER_GRPC_SERVICE_NAME,
  type MakeFriendRequest,
  type MakeFriendResponse,
  type UpdateStatusRequest,
  type UpdateStatusResponse,
  type UserGrpcServiceController,
  type UserRegisterRequest,
  type UserRegisterResponse,
} from 'interfaces/user.grpc'

@Controller()
export class UserController implements UserGrpcServiceController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod(USER_GRPC_SERVICE_NAME, 'register')
  async register(
    data: UserRegisterRequest,
    metadata: Metadata,
  ): Promise<UserRegisterResponse> {
    const res = await this.userService.register(data)
    return res
  }

  @GrpcMethod(USER_GRPC_SERVICE_NAME, 'login')
  async login(data: any, metadata: Metadata): Promise<any> {
    const res = await this.userService.login(data)
    return res
  }

  @GrpcMethod(USER_GRPC_SERVICE_NAME, 'makeFriend')
  async makeFriend(
    data: MakeFriendRequest,
    metadata: Metadata,
  ): Promise<MakeFriendResponse> {
    const res = await this.userService.makeFriend(data)
    return res
  }

  @GrpcMethod(USER_GRPC_SERVICE_NAME, 'updateStatusMakeFriend')
  async updateStatusMakeFriend(
    data: UpdateStatusRequest,
    metadata: Metadata,
  ): Promise<UpdateStatusResponse> {
    const res = await this.userService.updateStatusMakeFriend(data)
    return res
  }
}
