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
  ],
  controllers: [AppController, ChatController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    RealtimeGateway,
  ],
  exports: [RealtimeGateway, NotificationModule, ChatModule],
})
export class AppModule {}
