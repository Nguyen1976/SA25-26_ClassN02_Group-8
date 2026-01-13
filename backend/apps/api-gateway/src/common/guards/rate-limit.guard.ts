import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core/services/reflector.service'
import Redis from 'ioredis'
import { RATE_LIMIT_OPTIONS_KEY } from '../decorators/rate-limit.decorator'
import { LoggerService } from '@app/logger'
import { Request } from 'express'

/**
 * Rate Limitting Guard sử dụng redis cloud (từ CachedService)
 * Giới hạn số request per IP address hoặc per user
 *
 * Cách sử dụng (Global):
 * Được đăng ký trong AppModule như một APP_GUARD
 *
 * Cách sử udnjg per endpoint:
 * @RateLimit({ limit: number, ttl: number })
 * //login
 * async login(@Body() loginDto: LoginDto) {}
 *
 * Mặc định 100 request per 60 seconds
 */

@Injectable()
export class CustomRateLimitGuard implements CanActivate {
  private readonly defaultLimit: number = 200
  private readonly defaultTtl: number = 60 // seconds

  constructor(
    private reflector: Reflector,
    @Inject('REDIS_CLIENT')
    private redisClient: Redis,
    private readonly logger: LoggerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const decoratorOptions = this.reflector.get<{
        limit?: number
        ttl?: number
      }>(RATE_LIMIT_OPTIONS_KEY, context.getHandler())

      const limit = decoratorOptions?.limit || this.defaultLimit
      const ttl = decoratorOptions?.ttl || this.defaultTtl

      const request = context.switchToHttp().getRequest<Request>()
      const identifier = this.getIdentifier(request)
      const key = `throttle:${identifier}`

      const current = await this.redisClient.incr(key)

      if (current === 1) {
        await this.redisClient.expire(key, ttl)
      }

      if (current > limit) {
        throw new HttpException(
          {
            status: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Too many requests, please try again later.',
            retryAfter: ttl,
          },
          HttpStatus.TOO_MANY_REQUESTS,
          { cause: { retryAfter: ttl } },
        )
      }

      ;(request as any).rateLimit = {
        limit,
        current,
        remaining: limit - current,
        resetTime: Date.now() + ttl * 1000,
      }

      return true
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      this.logger.error('Rate limit check failed: ', error)
      return true
    }
  }

  private getIdentifier(request: Request): string {
    if ((request as any).user?.userId) {
      return `user:${(request as any).user.userId}`
    }

    const ip =
      request.ip ||
      (request.headers['x-forwarded-for'] as string).split(',')[0] ||
      request.socket.remoteAddress ||
      'unknown'

    return `ip:${ip}`
  }
}
