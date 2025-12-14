import { Controller, Get } from '@nestjs/common'
import { ChatService } from './chat.service'
import {
  Ctx,
  EventPattern,
  GrpcMethod,
  Payload,
  RmqContext,
} from '@nestjs/microservices'
import {
  CHAT_GRPC_SERVICE_NAME,
  CreateConversationResponse,
  type CreateConversationRequest,
} from 'interfaces/chat.grpc'
import { Metadata } from '@grpc/grpc-js'

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @GrpcMethod(CHAT_GRPC_SERVICE_NAME, 'createConversation')
  async createConversation(
    data: CreateConversationRequest,
    metadata: Metadata,
  ): Promise<CreateConversationResponse> {
    const res = await this.chatService.createConversation(data)
    return res
  }
}
