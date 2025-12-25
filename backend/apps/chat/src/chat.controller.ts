import { Controller } from '@nestjs/common'
import { ChatService } from './chat.service'
import { GrpcMethod, RpcException } from '@nestjs/microservices'
import {
  type AddMemberToConversationRequest,
  CHAT_GRPC_SERVICE_NAME,
  type CreateConversationResponse,
  type CreateConversationRequest,
  type GetConversationsRequest,
  GetConversationsResponse,
  type GetMessagesRequest,
} from 'interfaces/chat.grpc'
import { Metadata, status } from '@grpc/grpc-js'

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

  @GrpcMethod(CHAT_GRPC_SERVICE_NAME, 'addMemberToConversation')
  async addMemberToConversation(
    data: AddMemberToConversationRequest,
    metadata: Metadata,
  ): Promise<any> {
    try {
      const res = await this.chatService.addMemberToConversation(data)
      return res
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: error.message || 'Internal server error',
      })
    }
  }

  @GrpcMethod(CHAT_GRPC_SERVICE_NAME, 'getConversations')
  async getConversations(
    data: GetConversationsRequest,
    metadata: Metadata,
  ): Promise<GetConversationsResponse> {
    const res = await this.chatService.getConversations(data.userId, data)
    return res
  }

  @GrpcMethod(CHAT_GRPC_SERVICE_NAME, 'getMessagesByConversationId')
  async getMessagesByConversationId(
    data: GetMessagesRequest,
    metadata: Metadata,
  ): Promise<any> {
    const res = await this.chatService.getMessagesByConversationId(
      data.conversationId,
      data.userId,
      { limit: data.limit, page: data.page },
    )
    return res
  }
}
