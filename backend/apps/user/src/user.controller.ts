import { Controller } from '@nestjs/common'
import { UserService } from './user.service'
import { GrpcMethod, MessagePattern } from '@nestjs/microservices'
import type { Metadata, ServerUnaryCall } from '@grpc/grpc-js'
import type { User, userId, UserServiceController } from 'interfaces/user'

@Controller()
export class UserController implements UserServiceController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserService', 'getUser')
  getUser(data: userId, metadata: Metadata): User {
    return {
      id: data.id,
      name: 'John Doe',
    } as User
  }
}
