import { PrismaService } from '@app/prisma'
import { UtilService } from '@app/util/util.service'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { status } from '@grpc/grpc-js'
import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { RpcException } from '@nestjs/microservices'
import { Status } from '@prisma/client'
import {
  DetailMakeFriendResponse,
  ListFriendsResponse,
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
import { EXCHANGE_RMQ } from 'libs/constant/rmq/exchange'
import {
  UserCreatedPayload,
  UserMakeFriendPayload,
  UserUpdateStatusMakeFriendPayload,
} from 'libs/constant/rmq/payload'
import { ROUTING_RMQ } from 'libs/constant/rmq/routing'

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
    let payload: UserCreatedPayload = {
      id: res.id,
      email: res.email,
      username: res.username,
    }

    //test emit event to rabbitmq
    this.amqpConnection.publish(
      EXCHANGE_RMQ.USER_EVENTS,
      ROUTING_RMQ.USER_CREATED,
      payload,
    )
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
    const friendRequest = await this.prisma.friendRequest.create({
      data: {
        fromUserId: data.inviterId,
        toUserId: friend.id,
        status: Status.PENDING,
      },
    })
    const payload: UserMakeFriendPayload = {
      friendRequestId: friendRequest.id,
      inviterId: data.inviterId,
      inviterName: data.inviterName,

      inviteeEmail: data.inviteeEmail,
      inviteeName: friend.username,
      inviteeId: friend.id,
    }

    this.amqpConnection.publish(
      EXCHANGE_RMQ.USER_EVENTS,
      ROUTING_RMQ.USER_MAKE_FRIEND,
      payload,
    )

    return {
      status: 'SUCCESS',
    } as MakeFriendResponse
  }

  async updateStatusMakeFriend(
    data: UpdateStatusRequest,
  ): Promise<UpdateStatusResponse> {
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

    if(friendRequest.status !== Status.PENDING){
      throw new RpcException({
        code: status.FAILED_PRECONDITION,
        message: 'Friend request already responded',
      })
    }
    //update status dựa theo status
    await this.prisma.friendRequest.updateMany({
      where: {
        fromUserId: data.inviterId,
        toUserId: data.inviteeId,
      },
      data: {
        status: data.status as Status,
      },
    })

    let inviterUpdate
    let inviteeUpdate
    //nếu chấp nhận thì update friend ở cả 2 user
    if (data.status === Status.ACCEPTED) {
      //update mảng friends trong user của cả 2
      inviterUpdate = await this.prisma.user.update({
        where: {
          id: data.inviterId,
        },
        data: {
          friends: {
            push: data.inviteeId,
          },
        },
      })
      inviteeUpdate = await this.prisma.user.update({
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

    const payload: UserUpdateStatusMakeFriendPayload = {
      inviterId: data.inviterId, //ngươi nhận thông báo
      inviteeId: data.inviteeId,
      inviteeName: data.inviteeName,
      status: data.status,
      members: [
        {
          userId: data.inviterId,
          username: inviterUpdate?.username || '',
          avatar: inviterUpdate?.avatar || '',
        },
        {
          userId: data.inviteeId,
          username: inviteeUpdate?.username || '',
          avatar: inviteeUpdate?.avatar || '',
        },
      ],
    }

    this.amqpConnection.publish(
      EXCHANGE_RMQ.USER_EVENTS,
      ROUTING_RMQ.USER_UPDATE_STATUS_MAKE_FRIEND,
      payload,
    )

    //thằng conversation cũng sẽ nhận và create conservation

    return { status: 'SUCCESS' }
  }

  async listFriends(userId: string): Promise<ListFriendsResponse> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    })
    if (!user) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'User not found',
      })
    }
    const friends = await this.prisma.user.findMany({
      where: {
        id: { in: user.friends || [] },
      },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
      },
    })
    return { friends } as ListFriendsResponse
  }

  async detailMakeFriend(
    friendRequestId: string,
  ): Promise<DetailMakeFriendResponse> {
    const friendRequest = await this.prisma.friendRequest.findUnique({
      where: {
        id: friendRequestId,
      },
    })
    if (!friendRequest) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Friend request not found',
      })
    }
    //get user details
    const fromUser = await this.prisma.user.findUnique({
      where: {
        id: friendRequest.fromUserId,
      },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
      },
    })

    return {
      ...friendRequest,
      fromUser: fromUser,
      createdAt: friendRequest.createdAt.toString(),
      updatedAt: friendRequest.updatedAt.toString(),
    } as DetailMakeFriendResponse
  }
}
