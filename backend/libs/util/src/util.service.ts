import { HttpException, Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices/exceptions/rpc-exception'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class UtilService {
  async hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 10)
    return hash
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, hash)
    return isMatch
  }

  dateToTimestamp = (date: Date) => ({
    seconds: Math.floor(date.getTime() / 1000),
    nanos: (date.getTime() % 1000) * 1e6,
  })

  safeExecute = async <T>(fn: () => Promise<T>): Promise<T> => {
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
}
