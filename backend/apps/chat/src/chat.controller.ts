import { Controller, Get } from '@nestjs/common'
import { ChatService } from './chat.service'
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices'

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  
}
