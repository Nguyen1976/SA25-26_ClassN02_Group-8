import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { RedisModule } from '@app/redis'
import { PrismaModule } from '@app/prisma'
import { JwtModule } from '@nestjs/jwt'
import { APP_GUARD } from '@nestjs/core'
import { AuthGuard, CommonModule } from '@app/common'
import { UtilModule } from '@app/util'
import { ClientsModule, Transport } from '@nestjs/microservices'

@Module({
  imports: [
    RedisModule.forRoot(
      {
        host: 'localhost',
        port: 6379,
        db: 0,
      },
      'USER_REDIS',
    ),
    PrismaModule,
    CommonModule,
    UtilModule,
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'], // Nên để trong process.env
          queue: 'notification_queue',
          queueOptions: {
            durable: true, // Tin nhắn được lưu vào đĩa cứng, an toàn khi crash
          },
        },
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
