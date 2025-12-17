import { PrismaService } from '@app/prisma'
import { UtilService } from '@app/util/util.service'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { status } from '@grpc/grpc-js'
import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { RpcException } from '@nestjs/microservices'
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
        email: data.inviteeEmail,
      },
    })
    if (!friend) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Friend not found',
      })
    }

    //tạo bản ghi friend request
    await this.prisma.friendRequest.create({
      data: {
        fromUserId: data.inviterId,
        toUserId: friend.id,
        status: FriendRequestStatus.PENDING,
      },
    })

    //vấn đề về việc notifi thì để bên notification service xử lý
    this.amqpConnection.publish('user.events', 'user.makeFriend', {
      inviterId: data.inviterId,
      inviterName: data.inviterName,

      inviteeEmail: data.inviteeEmail,
      inviteeName: friend.username,
      inviteeId: friend.id,
    })

    return {
      status: 'SUCCESS',
    } as MakeFriendResponse
  }

  async updateStatusMakeFriend(
    data: UpdateStatusRequest,
  ): Promise<UpdateStatusResponse> {
    /**
     * status: dto.status as FriendRequestStatus,
      inviteeId: dto.inviteeId,
      inviterId: dto.inviterId,
      inviteeName: dto.inviteeName,
     * 
     */
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
      await this.prisma.user.update({
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

    this.amqpConnection.publish('user.events', 'user.updateStatusMakeFriend', {
      inviterId: data.inviterId, //ngươi nhận thông báo
      inviteeId: data.inviteeId,
      inviteeName: data.inviteeName,
      status: data.status,
    })

    //thằng conversation cũng sẽ nhận và create conservation

    return { status: 'SUCCESS' }
  }
}
