import { PrismaService } from '@app/prisma/prisma.service'
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { Inject, Injectable } from '@nestjs/common'
import { FriendRequestStatus } from 'interfaces/user'

@Injectable()
export class ChatService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  
}
