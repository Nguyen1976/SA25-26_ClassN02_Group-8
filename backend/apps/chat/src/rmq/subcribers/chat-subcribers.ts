import { Injectable } from '@nestjs/common'
import { ChatService } from '../../chat.service'
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { EXCHANGE_RMQ } from 'libs/constant/rmq/exchange'
import { ROUTING_RMQ } from 'libs/constant/rmq/routing'
import { QUEUE_RMQ } from 'libs/constant/rmq/queue'
import { safeExecute } from '@app/common/rpc/safe-execute'
import type {
  UserUpdatedPayload,
  UserUpdateStatusMakeFriendPayload,
} from 'libs/constant/rmq/payload'

@Injectable()
export class MessageSubscriber {
  constructor(private readonly chatService: ChatService) {}
  
  @RabbitSubscribe({
    exchange: EXCHANGE_RMQ.USER_EVENTS,
    routingKey: ROUTING_RMQ.USER_UPDATE_STATUS_MAKE_FRIEND,
    queue: QUEUE_RMQ.CHAT_USER_UPDATE_STATUS_MAKE_FRIEND,
  })
  async createConversationWhenAcceptFriend(
    data: UserUpdateStatusMakeFriendPayload,
  ):Promise<void> {
    await safeExecute(() =>
      this.chatService.createConversationWhenAcceptFriend(data),
    )
  }

  @RabbitSubscribe({
    exchange: EXCHANGE_RMQ.USER_EVENTS,
    routingKey: ROUTING_RMQ.USER_UPDATED,
    queue: QUEUE_RMQ.CHAT_USER_UPDATED,
  })
  async handleUserUpdated(data: UserUpdatedPayload): Promise<void> {
    await safeExecute(() => this.chatService.handleUserUpdated(data))
  }
}
