import { NestFactory } from '@nestjs/core'
import { NotificationModule } from './notification.module'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { NOTIFICATION_PACKAGE_NAME } from 'interfaces/notification.grpc'
import { PORT_GRPC } from 'libs/constant/grpc/port-grpc.constant'

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationModule,
    {
      transport: Transport.GRPC,
      options: {
        package: NOTIFICATION_PACKAGE_NAME,
        protoPath: './proto/notification.grpc.proto',
        url: `localhost:${PORT_GRPC.NOTIFICATION_GRPC_PORT}`,
      },
    },
  )

  await app.listen()
}
bootstrap()
