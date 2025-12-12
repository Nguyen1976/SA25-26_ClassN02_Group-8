import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common'
import { Request } from 'express'

export const RequireLogin = () => SetMetadata('without-login', true)

export const UserInfo = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>()
    if (!request.user) return null
    return data ? request.user[data] : request.user
  },
)
