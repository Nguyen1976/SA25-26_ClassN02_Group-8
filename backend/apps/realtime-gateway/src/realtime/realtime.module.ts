import { Module } from '@nestjs/common'
import { RealtimeGateway } from './realtime.gateway'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'

@Module({
  imports: [
    RabbitMQModule.forRoot({
      exchanges: [],
      uri: 'amqp://localhost:5672',
      connectionInitOptions: { wait: true },
    })
  ],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
