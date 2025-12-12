import { Controller, Get, Inject } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices'
import { MailerService } from '@app/mailer'

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Inject(MailerService)
  private readonly mailerService: MailerService

  @EventPattern('user.created')
  async handleUserRegistered(@Payload() data, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef()
    const originalMsg = context.getMessage()

    try {
      // 1. Thực hiện logic nghiệp vụ
      console.log(
        `📧 [Notification Service] Đang gửi email chào mừng tới: ${data.email}...`,
      )

      await this.mailerService.sendUserConfirmation(data)

      console.log('✅ Email đã gửi thành công!')

      // 2. QUAN TRỌNG: Xác nhận đã xử lý xong (ACK)
      // Lúc này RabbitMQ mới xóa tin nhắn khỏi hàng đợi
      channel.ack(originalMsg)
    } catch (error) {
      console.error('❌ Lỗi khi gửi email:', error)
      // channel.nack(originalMsg)
    }
  }

  @EventPattern('user.makeFriend')
  async handleMakeFriend(@Payload() data, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef()
    const originalMsg = context.getMessage()
    try {
      console.log(
        `📧 [Notification Service] Đang gửi email lời mời kết bạn tới: ${data.friendEmail}...`,
      )
      await this.mailerService.sendMakeFriendNotification(data)
      console.log('✅ Email đã gửi thành công!')
      channel.ack(originalMsg)
    } catch (error) {
      console.error('❌ Lỗi khi gửi email:', error)
    }
  }
}
