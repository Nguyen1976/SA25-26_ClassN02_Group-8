import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { RedisModule } from '@app/redis'
import { PrismaModule } from '@app/prisma'
import { CommonModule } from '@app/common'
import { UtilModule } from '@app/util'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'

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
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
