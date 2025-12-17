import { forwardRef, Module } from '@nestjs/common'
import { ChatService } from './chat.service'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { CHAT_GRPC_SERVICE_NAME, CHAT_PACKAGE_NAME } from 'interfaces/chat.grpc'
import { PORT_GRPC } from 'libs/constant/grpc/port-grpc.constant'
import { AppModule } from '../app.module'
import { ChatController } from './chat.controller'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'

@Module({
  imports: [
    forwardRef(() => AppModule),
    ClientsModule.register([
      {
        name: CHAT_GRPC_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          package: CHAT_PACKAGE_NAME,
          protoPath: './proto/chat.grpc.proto',
          url: `localhost:${PORT_GRPC.CHAT_GRPC_PORT}`,
        },
      },
    ]),
    RabbitMQModule.forRoot({
      exchanges: [],
      uri: 'amqp://localhost:5672',
      connectionInitOptions: { wait: true },
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
/**
 * tạo conversation: conversationId, memberIds[]
 * add member to conversation: conversationId, memberIds[]
 *
 */
