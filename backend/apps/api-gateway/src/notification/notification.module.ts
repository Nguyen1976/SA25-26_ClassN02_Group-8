import { forwardRef, Module } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { NotificationController } from './notification.controller'
import { ClientsModule, Transport } from '@nestjs/microservices'
import {
  NOTIFICATION_GRPC_SERVICE_NAME,
  NOTIFICATION_PACKAGE_NAME,
} from 'interfaces/notification.grpc'
import { PORT_GRPC } from 'libs/constant/port-grpc.constant'
import { AppModule } from '../app.module'

@Module({
  imports: [
    forwardRef(() => AppModule),
    ClientsModule.register([
      {
        name: NOTIFICATION_GRPC_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          package: NOTIFICATION_PACKAGE_NAME,
          protoPath: './proto/notification.grpc.proto',
          url: `localhost:${PORT_GRPC.NOTIFICATION_GRPC_PORT}`,
        },
      },
    ]),
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
