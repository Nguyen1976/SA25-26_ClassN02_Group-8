import { status } from '@grpc/grpc-js'
import { RpcException } from '@nestjs/microservices'

export class UserErrors {
  static emailAlreadyExists(): never {
    throw new RpcException({
      code: status.ALREADY_EXISTS,
      message: 'Email already exists',
    })
  }

  static usernameAlreadyExists(): never {
    throw new RpcException({
      code: status.ALREADY_EXISTS,
      message: 'Username already exists',
    })
  }

  static userNotFound(): never {
    throw new RpcException({
      code: status.NOT_FOUND,
      message: 'User not found',
    })
  }

  static friendNotFound(): never {
    throw new RpcException({
      code: status.NOT_FOUND,
      message: 'Friend not found',
    })
  }

  static friendRequestNotFound(): never {
    throw new RpcException({
      code: status.NOT_FOUND,
      message: 'Friend request not found',
    })
  }

  static friendRequestAlreadyResponded(): never {
    throw new RpcException({
      code: status.FAILED_PRECONDITION,
      message: 'Friend request already responded',
    })
  }
}
