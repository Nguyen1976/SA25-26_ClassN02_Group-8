import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'

import { UserModule } from './user/user.module'
import { AuthGuard, CommonModule } from '@app/common'
import { APP_GUARD } from '@nestjs/core'
import { RealtimeGateway } from './realtime/realtime.gateway'
import { RedisModule } from '@app/redis'
import { NotificationModule } from './notification/notification.module'
import { ChatController } from './chat/chat.controller'
import { ChatModule } from './chat/chat.module'
import { RealtimeModule } from './realtime/realtime.module'
import { LoggerModule } from '@app/logger'
import { CustomRateLimitGuard } from './common/guards/rate-limit.guard'

@Module({
  imports: [
    UserModule,
    CommonModule,
    RedisModule.forRoot(
      {
        host: 'localhost',
        port: 6379,
        db: 0,
      },
      'REDIS_CLIENT',
    ),
    NotificationModule,
    ChatModule,
    RealtimeModule,
    LoggerModule.forService('Api-Gateway'),
  ],
  controllers: [AppController, ChatController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    RealtimeModule,
    {
      provide: APP_GUARD,
      useClass: CustomRateLimitGuard,
    }
  ],
  exports: [RealtimeModule, NotificationModule, ChatModule],
})
export class AppModule {}
