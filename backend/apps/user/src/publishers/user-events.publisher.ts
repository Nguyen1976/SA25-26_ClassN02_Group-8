import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import { Status } from '@prisma/client'
import { EXCHANGE_RMQ } from 'libs/constant/rmq/exchange'
import {
  UserCreatedPayload,
  UserMakeFriendPayload,
  UserUpdatedPayload,
  UserUpdateStatusMakeFriendPayload,
} from 'libs/constant/rmq/payload'
import { ROUTING_RMQ } from 'libs/constant/rmq/routing'

@Injectable()
export class UserEventsPublisher {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  publishUserCreated(payload: UserCreatedPayload): void {
    this.amqpConnection.publish(
      EXCHANGE_RMQ.USER_EVENTS,
      ROUTING_RMQ.USER_CREATED,
      payload,
    )
  }

  publishUserMakeFriend(payload: UserMakeFriendPayload): void {
    this.amqpConnection.publish(
      EXCHANGE_RMQ.USER_EVENTS,
      ROUTING_RMQ.USER_MAKE_FRIEND,
      payload,
    )
  }

  publishUserUpdateStatusMakeFriend(
    payload: UserUpdateStatusMakeFriendPayload,
  ): void {
    this.amqpConnection.publish(
      EXCHANGE_RMQ.USER_EVENTS,
      ROUTING_RMQ.USER_UPDATE_STATUS_MAKE_FRIEND,
      payload,
    )
  }

  publishUserUpdated(payload: UserUpdatedPayload): void {
    this.amqpConnection.publish(
      EXCHANGE_RMQ.USER_EVENTS,
      ROUTING_RMQ.USER_UPDATED,
      payload,
    )
  }
}
