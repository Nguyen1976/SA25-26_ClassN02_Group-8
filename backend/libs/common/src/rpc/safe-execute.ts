import { RpcException } from '@nestjs/microservices'
import { HttpException } from '@nestjs/common'

export async function safeExecute<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    // 1. Nếu là lỗi business đã chuẩn hóa
    if (err instanceof RpcException) {
      throw err
    }

    // 2. Nếu lỡ dùng HttpException trong service
    if (err instanceof HttpException) {
      throw new RpcException({
        code: err.getStatus(),
        message: err.message,
      })
    }

    // 3. Prisma, Mongo, bug, crash, undefined...
    console.error('🔥 Microservice crashed:', err)

    throw new RpcException({
      code: 'INTERNAL_SERVICE_ERROR',
      message: 'Service temporarily unavailable',
    })
  }
}
