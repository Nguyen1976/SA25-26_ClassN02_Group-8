import { PrismaService } from '@app/prisma'
import { Inject, Injectable } from '@nestjs/common'
import { UserRegisterRequest, UserRegisterResponse } from 'interfaces/user'
import { Redis as RedisClient } from 'ioredis'

@Injectable()
export class UserService {
  constructor() {}
  @Inject('USER_REDIS')
  private readonly redis: RedisClient

  @Inject(PrismaService)
  private readonly prisma: PrismaService

  async register(data: UserRegisterRequest): Promise<UserRegisterResponse> {
    // Implement registration logic here, e.g., save user to database
    // For demonstration, we will just return a mock response
    const res = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        username: data.username,
      },
    })
    return {
      id: res.id,
      email: res.email,
      username: res.username,
      accessToken: 'mockAccessToken',
      refreshToken: 'mockRefreshToken',
    }
  }
}
