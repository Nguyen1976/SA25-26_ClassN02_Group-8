import { PrismaService } from '@app/prisma'
import { UtilService } from '@app/util/util.service'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { status } from '@grpc/grpc-js'
import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { stat } from 'fs'
import { FriendRequestStatus } from 'interfaces/user'
import {
  MakeFriendRequest,
  MakeFriendResponse,
  UpdateStatusRequest,
  UpdateStatusResponse,
  UserLoginRequest,
  UserLoginResponse,
  UserRegisterRequest,
  UserRegisterResponse,
} from 'interfaces/user.grpc'
import { Redis as RedisClient } from 'ioredis'

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REDIS') private readonly redis: RedisClient,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(UtilService) private readonly utilService: UtilService,
    // @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
    private readonly amqpConnection: AmqpConnection,
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

    //test emit event to rabbitmq
    this.amqpConnection.publish('user.events', 'user.created', {
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
      userId: user.id,
      email: user.email,
      username: user.username,
    })

    return {
      ...user,
      token,
    }
  }

  async makeFriend(data: MakeFriendRequest): Promise<MakeFriendResponse> {
    //chekc email ton tai
    const friend = await this.prisma.user.findUnique({
      where: {
        email: data.friendEmail,
      },
    })
    if (!friend) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Friend not found',
      })
    }
    //gui mail moi ban be
    //username, email nhận
    this.amqpConnection.publish('user.events', 'user.makeFriend', {
      senderName: data.senderName,
      friendEmail: data.friendEmail,
      receiverName: friend.username,
    })

    const res = await this.prisma.friendRequest.create({
      data: {
        fromUserId: data.senderId,
        toUserId: friend.id,
        status: FriendRequestStatus.PENDING,
      },
    })

    return { status: res.status }
  }

  async updateStatusMakeFriend(
    data: UpdateStatusRequest,
  ): Promise<UpdateStatusResponse> {
    //tìm bản ghi dựa vào inviterId và inviteeId
    const friendRequest = await this.prisma.friendRequest.findFirst({
      where: {
        fromUserId: data.inviterId,
        toUserId: data.inviteeId,
      },
    })
    if (!friendRequest) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Friend request not found',
      })
    }
    //update status dựa theo status
    await this.prisma.friendRequest.updateMany({
      where: {
        fromUserId: data.inviterId,
        toUserId: data.inviteeId,
      },
      data: {
        status: data.status as FriendRequestStatus,
      },
    })

    let inventee
    //nếu chấp nhận thì update friend ở cả 2 user
    if (data.status === FriendRequestStatus.ACCEPT) {
      //update mảng friends trong user của cả 2
      await this.prisma.user.update({
        where: {
          id: data.inviterId,
        },
        data: {
          friends: {
            push: data.inviteeId,
          },
        },
      })
      inventee = await this.prisma.user.update({
        where: {
          id: data.inviteeId,
        },
        data: {
          friends: {
            push: data.inviterId,
          },
        },
      })
    }
    //loại bỏ phần này lên để gateway điều phối
    //bắn message qua notification kèm theo status và trạng thái online của ô còn lại
    // this.amqpConnection.publish('user.events', 'user.updateStatusMakeFriend', {
    //   inviterId: data.inviterId,
    //   inviteeName: inventee ? inventee.username : '',
    //   inviteeId: data.inviteeId,
    //   status: data.status,
    // })
    return { status: 'SUCCESS' }
  }
}

/**
 * model friendRequest {
  id String @id @default(auto()) @map("_id") @db.ObjectId
  fromUserId String @db.ObjectId
  toUserId String @db.ObjectId
  status Status @default(PENDING)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
 * 
 * 
 */
