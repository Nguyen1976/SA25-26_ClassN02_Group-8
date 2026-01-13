import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import { EXCHANGE_RMQ } from 'libs/constant/rmq/exchange'
import type { MemberAddedToConversationPayload } from 'libs/constant/rmq/payload'
import { ROUTING_RMQ } from 'libs/constant/rmq/routing'

@Injectable()
export class ChatEventsPublisher {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  publishConversationCreated(conversation: any): void {
    this.amqpConnection.publish(
      EXCHANGE_RMQ.CHAT_EVENTS,
      ROUTING_RMQ.CONVERSATION_CREATED,
      conversation,
    )
  }

  publishMessageSent(message: any, memberIds: string[]): void {
    this.amqpConnection.publish(
      EXCHANGE_RMQ.CHAT_EVENTS,
      ROUTING_RMQ.MESSAGE_SENT,
      {
        ...message,
        memberIds,
      },
    )
  }

  publishMemberAddedToConversation(
    payload: MemberAddedToConversationPayload,
  ): void {
    this.amqpConnection.publish(
      EXCHANGE_RMQ.CHAT_EVENTS,
      ROUTING_RMQ.MEMBER_ADDED_TO_CONVERSATION,
      payload,
    )
  }
}
