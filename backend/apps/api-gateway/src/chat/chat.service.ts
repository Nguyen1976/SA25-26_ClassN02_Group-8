import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'
import {
  CHAT_GRPC_SERVICE_NAME,
  CreateConversationRequest,
  CreateConversationResponse,
} from 'interfaces/chat.grpc'
import { NotificationGrpcServiceClient } from 'interfaces/notification.grpc'
import { firstValueFrom } from 'rxjs/internal/firstValueFrom'

@Injectable()
export class ChatService implements OnModuleInit {
  private chatClientService: any
  constructor(
    @Inject(CHAT_GRPC_SERVICE_NAME) private readonly chatClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.chatClientService =
      this.chatClient.getService<NotificationGrpcServiceClient>(
        CHAT_GRPC_SERVICE_NAME,
      )
  }

  /**
   * 
   * model conversation {
        id String @id @default(auto()) @map("_id") @db.ObjectId
        type conversationType @default(DIRECT)

        //trong trường hợp là cuộc trò chuyện cá nhận thì 2 thằng này là null
        groupName String?
        groupAvatar String?

        createdAt DateTime @default(now())
        updatedAt DateTime @updatedAt
        }

        model conversationMember {
        id String @id @default(auto()) @map("_id") @db.ObjectId
        conversationId String @db.ObjectId

        userId String? @db.ObjectId
        role String? //nếu là nhóm thì có vai trò như admin hay member

        joinedAt DateTime @default(now())
        }
   */
  async createConversation(
    dto: CreateConversationRequest,
  ): Promise<CreateConversationResponse> {
    //nhận vào type, memberIds, groupName?, groupAvatar?
    let observable = this.chatClientService.createConversation(dto)
    
    return await firstValueFrom(observable)
  }
}
