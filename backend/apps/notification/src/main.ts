import { NestFactory } from '@nestjs/core'
import { NotificationModule } from './notification.module'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'notification_queue',
        noAck: false,
        queueOptions: {
          durable: true,
        },
        prefetchCount: 1,
      },
    },
  )

  await app.listen()
}
bootstrap()
