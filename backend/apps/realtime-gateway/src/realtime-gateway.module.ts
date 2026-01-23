import { Module } from '@nestjs/common'
import { RealtimeGatewayController } from './realtime-gateway.controller'
import { RealtimeGatewayService } from './realtime-gateway.service'
import { RealtimeGateway } from './realtime/realtime.gateway'
import { RealtimeModule } from './realtime/realtime.module'
import { RedisModule } from '@app/redis'
import { CommonModule } from '@app/common'

@Module({
  imports: [
    RealtimeModule,
    RedisModule.forRoot(
      {
        host: 'localhost',
        port: 6379,
        db: 0,
      },
      'REDIS_CLIENT',
    ),
    CommonModule,
  ],
  controllers: [RealtimeGatewayController],
  providers: [RealtimeGatewayService, RealtimeGateway],
})
export class RealtimeGatewayModule {}
