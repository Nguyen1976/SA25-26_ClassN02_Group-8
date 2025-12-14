import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import {
  createNotificationRequest,
  createNotificationResponse,
  NOTIFICATION_GRPC_SERVICE_NAME,
  NotificationGrpcServiceClient,
} from 'interfaces/notification.grpc'
import { RealtimeGateway } from '../realtime/realtime.gateway'
import type { ClientGrpc } from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs/internal/firstValueFrom'

@Injectable()
export class NotificationService implements OnModuleInit {
  private notificationClientService: NotificationGrpcServiceClient
  constructor(
    @Inject(NOTIFICATION_GRPC_SERVICE_NAME)
    private notificationClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.notificationClientService =
      this.notificationClient.getService<NotificationGrpcServiceClient>(
        NOTIFICATION_GRPC_SERVICE_NAME,
      )
  }

  async createNotification(
    dto: createNotificationRequest,
  ): Promise<createNotificationResponse> {
    let observable = this.notificationClientService.createNotification(dto)

    return await firstValueFrom(observable)
  }
}
