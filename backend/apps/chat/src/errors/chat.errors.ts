import { status } from '@grpc/grpc-js'
import { RpcException } from '@nestjs/microservices'

export class ChatErrors {
  static conversationNotEnoughMembers(): never {
    throw new RpcException({
      code: status.FAILED_PRECONDITION,
      message: 'A group conversation must have at least 3 members',
    })
  }

  static senderNotMember(): never {
    throw new RpcException({
      code: status.FAILED_PRECONDITION,
      message: 'Sender is not a member of the conversation',
    })
  }

  static conversationNotFound(): never {
    throw new RpcException({
      code: status.NOT_FOUND,
      message: 'Conversation not found',
    })
  }

  static userNotMember(): never {
    throw new RpcException({
      code: status.FAILED_PRECONDITION,
      message: 'User is not a member of the conversation',
    })
  }

  static invalidLastReadMessage(): never {
    throw new RpcException({
      code: status.FAILED_PRECONDITION,
      message: 'lastReadMessageId does not belong to the conversation',
    })
  }
}
