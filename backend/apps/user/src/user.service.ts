import { StorageR2Service } from '@app/storage-r2'
import { UtilService } from '@app/util/util.service'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { status } from '@grpc/grpc-js'
import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { RpcException } from '@nestjs/microservices'
import { Status } from '@prisma/client'
import {
  DetailMakeFriendResponse,
  GetUserByIdResponse,
  ListFriendsResponse,
  MakeFriendRequest,
  MakeFriendResponse,
  UpdateProfileRequest,
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
  UserUpdatedPayload,
  UserUpdateStatusMakeFriendPayload,
} from 'libs/constant/rmq/payload'
import { ROUTING_RMQ } from 'libs/constant/rmq/routing'
import { lookup } from 'mime-types'
import { UserRepository, FriendRequestRepository } from './repositories'

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REDIS') private readonly redis: RedisClient,
    private readonly userRepo: UserRepository,
    private readonly friendRequestRepo: FriendRequestRepository,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(UtilService) private readonly utilService: UtilService,
    private readonly amqpConnection: AmqpConnection,
    @Inject(StorageR2Service)
    private readonly storageR2Service: StorageR2Service,
  ) {}

  async register(data: UserRegisterRequest): Promise<UserRegisterResponse> {
    const existingUser = await this.userRepo.findByEmail(data.email)
    if (existingUser) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'Email already exists',
      })
    }

    const existingUsername = await this.userRepo.findByUsername(data.username)
    if (existingUsername) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'Username already exists',
      })
    }

    const hashedPassword = await this.utilService.hashPassword(data.password)
    const { createdAt, updatedAt, password, ...res } =
      await this.userRepo.create({
        email: data.email,
        username: data.username,
        password: hashedPassword,
      })

    const payload: UserCreatedPayload = {
      id: res.id,
      email: res.email,
      username: res.username,
    }

    this.amqpConnection.publish(
      EXCHANGE_RMQ.USER_EVENTS,
      ROUTING_RMQ.USER_CREATED,
      payload,
    )
    return res
  }

  async login(data: UserLoginRequest): Promise<UserLoginResponse> {
    const user = await this.userRepo.findByEmail(data.email)
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
      avatar: user.avatar || '',
      bio: user.bio || '',
      token,
    } as UserLoginResponse
  }

  async getUserById(userId: string): Promise<GetUserByIdResponse> {
    const user = await this.userRepo.findByIdWithSelect(userId)
    if (!user) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'User not found',
      })
    }
    return user as GetUserByIdResponse
  }

  async makeFriend(data: MakeFriendRequest): Promise<MakeFriendResponse> {
    const friend = await this.userRepo.findByEmail(data.inviteeEmail)
    if (!friend) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Friend not found',
      })
    }

    const friendRequest = await this.friendRequestRepo.create({
      fromUserId: data.inviterId,
      toUserId: friend.id,
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
    const friendRequest = await this.friendRequestRepo.findByUsers(
      data.inviterId,
      data.inviteeId,
    )

    if (!friendRequest) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Friend request not found',
      })
    }

    if (friendRequest.status !== Status.PENDING) {
      throw new RpcException({
        code: status.FAILED_PRECONDITION,
        message: 'Friend request already responded',
      })
    }

    await this.friendRequestRepo.updateStatus(
      data.inviterId,
      data.inviteeId,
      data.status as Status,
    )

    let inviterUpdate
    let inviteeUpdate

    if (data.status === Status.ACCEPTED) {
      inviterUpdate = await this.userRepo.updateFriends(
        data.inviterId,
        data.inviteeId,
      )
      inviteeUpdate = await this.userRepo.updateFriends(
        data.inviteeId,
        data.inviterId,
      )
    }

    const payload: UserUpdateStatusMakeFriendPayload = {
      inviterId: data.inviterId,
      inviteeId: data.inviteeId,
      inviteeName: data.inviteeName,
      status: data.status,
      members: [
        {
          userId: data.inviterId,
          username: inviterUpdate?.username || '',
          avatar: inviterUpdate?.avatar || '',
          fullName: inviterUpdate?.fullName || '',
        },
        {
          userId: data.inviteeId,
          username: inviteeUpdate?.username || '',
          avatar: inviteeUpdate?.avatar || '',
          fullName: inviteeUpdate?.fullName || '',
        },
      ],
    }

    this.amqpConnection.publish(
      EXCHANGE_RMQ.USER_EVENTS,
      ROUTING_RMQ.USER_UPDATE_STATUS_MAKE_FRIEND,
      payload,
    )

    return { status: 'SUCCESS' }
  }

  async listFriends(userId: string): Promise<ListFriendsResponse> {
    const user = await this.userRepo.findById(userId)
    if (!user) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'User not found',
      })
    }

    const friends = await this.userRepo.findManyByIds(user.friends || [])
    return { friends } as ListFriendsResponse
  }

  async detailMakeFriend(
    friendRequestId: string,
  ): Promise<DetailMakeFriendResponse> {
    const friendRequest = await this.friendRequestRepo.findById(friendRequestId)
    if (!friendRequest) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Friend request not found',
      })
    }

    const fromUser = await this.userRepo.findByIdWithSelect(
      friendRequest.fromUserId,
    )

    return {
      ...friendRequest,
      fromUser: fromUser,
      createdAt: friendRequest.createdAt.toString(),
      updatedAt: friendRequest.updatedAt.toString(),
    } as DetailMakeFriendResponse
  }

  async updateProfile(data: UpdateProfileRequest): Promise<any> {
    let avatarUrl = ''
    if (data.avatar && data.avatarFilename) {
      const mime =
        lookup(data.avatarFilename || '') || 'application/octet-stream'

      avatarUrl = await this.storageR2Service.upload({
        buffer: data.avatar as Buffer,
        mime: mime,
        folder: 'avatars',
        ext: data.avatarFilename?.split('.').pop() || 'bin',
      })
    }

    const user = await this.userRepo.updateProfile(data.userId, {
      fullName: data.fullName,
      bio: data.bio,
      avatar: avatarUrl,
    })

    const payload: UserUpdatedPayload = {
      userId: user.id,
      fullName: data.fullName || undefined,
      avatar: avatarUrl || undefined,
    }

    this.amqpConnection.publish(
      EXCHANGE_RMQ.USER_EVENTS,
      ROUTING_RMQ.USER_UPDATED,
      payload,
    )

    return {
      fullName: user.fullName || '',
      bio: user.bio || '',
      ...(avatarUrl ? { avatar: avatarUrl } : {}),
    }
  }
}
