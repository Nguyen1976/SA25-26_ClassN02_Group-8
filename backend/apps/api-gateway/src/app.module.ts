import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { Client, ClientsModule, Transport } from '@nestjs/microservices'
import { USER_GRPC_SERVICE_NAME, USER_PACKAGE_NAME } from 'interfaces/user.grpc'
import { UserModule } from './user/user.module'
import { AuthGuard, CommonModule } from '@app/common'
import { APP_GUARD } from '@nestjs/core'
import { PORT_GRPC } from 'libs/constant/port-grpc.constant'
import { RealtimeGateway } from './realtime/realtime.gateway'
import { RedisModule } from '@app/redis'
import {
  NOTIFICATION_GRPC_SERVICE_NAME,
  NOTIFICATION_PACKAGE_NAME,
} from 'interfaces/notification.grpc'
import { CHAT_GRPC_SERVICE_NAME, CHAT_PACKAGE_NAME } from 'interfaces/chat.grpc'
import { NotificationModule } from './notification/notification.module'
import { ChatController } from './chat/chat.controller';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
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
  exports: [ClientsModule, RealtimeGateway, NotificationModule],
})
export class AppModule {}
