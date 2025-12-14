import { Module } from '@nestjs/common'
import { NotificationController } from './notification.controller'
import { NotificationService } from './notification.service'
import { MailerModule } from '@app/mailer'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from '@app/prisma'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { UtilModule } from '@app/util'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    MailerModule,
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
    UtilModule
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
