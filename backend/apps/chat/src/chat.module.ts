import { Module } from '@nestjs/common'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { PrismaModule } from '@app/prisma'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'

@Module({
  imports: [
    PrismaModule,
    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: 'user.events',
          type: 'topic',
        },
      ],
      uri: 'amqp://localhost:5672',
      connectionInitOptions: { wait: true },
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
