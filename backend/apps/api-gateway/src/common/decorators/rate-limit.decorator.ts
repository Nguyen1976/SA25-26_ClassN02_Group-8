import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { CustomRateLimitGuard } from '../guards/rate-limit.guard'

export const RATE_LIMIT_OPTIONS_KEY = 'rate-limit-options'

export const RateLimit = (options?: { limit?: number; ttl?: number }) => {
  return applyDecorators(
    SetMetadata(RATE_LIMIT_OPTIONS_KEY, options || {}),
    UseGuards(CustomRateLimitGuard),
  )
}
