import { Controller, Get, Inject } from '@nestjs/common'
import { NotificationService } from './notification.service'
import {
  Ctx,
  EventPattern,
  GrpcMethod,
  Payload,
  RmqContext,
} from '@nestjs/microservices'
import {
  NOTIFICATION_GRPC_SERVICE_NAME,
  type createNotificationRequest,
  type createNotificationResponse,
  type NotificationGrpcServiceController,
} from 'interfaces/notification.grpc'
import { Metadata } from '@grpc/grpc-js'

@Controller()
export class NotificationController implements NotificationGrpcServiceController {
  constructor(private readonly notificationService: NotificationService) {}
  //thằng @golevelup/nestjs-rabbitmq sẽ k quét rabbitsub trong controller lên mọi thứ được chuyển thẳng vào trong service

  @GrpcMethod(NOTIFICATION_GRPC_SERVICE_NAME, 'createNotification')
  async createNotification(
    data: createNotificationRequest,
    metadata: Metadata,
  ): Promise<any> {
    const res = await this.notificationService.createNotification(data)
    return res
  }
}
