import { Module } from '@nestjs/common'
import { RealtimeGateway } from './realtime.gateway'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { ChatModule } from '../chat/chat.module'

@Module({
  imports: [
    RabbitMQModule.forRoot({
      exchanges: [],
      uri: 'amqp://localhost:5672',
      connectionInitOptions: { wait: true },
    }),
    ChatModule,
  ],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
