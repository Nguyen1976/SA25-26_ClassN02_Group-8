import { Controller, Inject } from '@nestjs/common'
import { UserService } from './user.service'
import { GrpcMethod, MessagePattern } from '@nestjs/microservices'
import type { Metadata, ServerUnaryCall } from '@grpc/grpc-js'
import type {
  UserRegisterRequest,
  UserRegisterResponse,
  UserServiceController,
} from 'interfaces/user'
import { EXCHANGE } from '@app/common/constants/exchange'
import type { Channel } from 'amqplib'

@Controller()
export class UserController implements UserServiceController {
  constructor(private readonly userService: UserService) {}


  @GrpcMethod('UserService', 'register')
  async register(
    data: UserRegisterRequest,
    metadata: Metadata,
  ): Promise<UserRegisterResponse> {
    const res = await this.userService.register(data)
    return res
  }

  @GrpcMethod('UserService', 'login')
  async login(data: any, metadata: Metadata): Promise<any> {
    const res = await this.userService.login(data)
    return res
  }
}
