import { PrismaService } from '@app/prisma'
import { UtilService } from '@app/util/util.service'
import { status } from '@grpc/grpc-js'
import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { stat } from 'fs'
import {
  UserLoginRequest,
  UserLoginResponse,
  UserRegisterRequest,
  UserRegisterResponse,
} from 'interfaces/user'
import { Redis as RedisClient } from 'ioredis'

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REDIS') private readonly redis: RedisClient,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(UtilService) private readonly utilService: UtilService,
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  async register(data: UserRegisterRequest): Promise<UserRegisterResponse> {
    //check email exist
    //check username exist
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    })
    if (existingUser) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'Email already exists',
      })
    }
    const existingUsername = await this.prisma.user.findUnique({
      where: {
        username: data.username,
      },
    })
    if (existingUsername) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'Username already exists',
      })
    }

    const { createdAt, updatedAt, password, ...res } =
      await this.prisma.user.create({
        data: {
          email: data.email,
          password: await this.utilService.hashPassword(data.password),
          username: data.username,
        },
      })

    this.client.emit('user.created', {
      id: res.id,
      email: res.email,
      username: res.username,
    })
    return res
  }

  async login(data: UserLoginRequest): Promise<UserLoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    })
    if (!user) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'User not found',
      })
    }
    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      username: user.username,
    })
    return {
      ...user,
      token,
    }
  }
}
