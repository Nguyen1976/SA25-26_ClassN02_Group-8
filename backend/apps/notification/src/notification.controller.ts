import { Controller, Get } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices'

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('user.created')
  async handleUserRegistered(@Payload() data, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef()
    const originalMsg = context.getMessage()

    try {
      // 1. Thực hiện logic nghiệp vụ
      console.log(
        `📧 [Notification Service] Đang gửi email chào mừng tới: ${data.email}...`,
      )

      // Giả lập xử lý tốn thời gian
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log('✅ Email đã gửi thành công!')

      // 2. QUAN TRỌNG: Xác nhận đã xử lý xong (ACK)
      // Lúc này RabbitMQ mới xóa tin nhắn khỏi hàng đợi
      channel.ack(originalMsg)
    } catch (error) {
      console.error('❌ Lỗi khi gửi email:', error)

      // Tùy chiến lược:
      // - channel.nack(originalMsg): Đẩy lại vào hàng đợi để retry
      // - Hoặc log lỗi và vẫn ack để bỏ qua tin nhắn lỗi (tránh lặp vô tận)
    }
  }
}
