import { StorageR2Service } from '@app/storage-r2'
import { UtilService } from '@app/util/util.service'
import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Status } from '@prisma/client'
import { Redis as RedisClient } from 'ioredis'
import { lookup } from 'mime-types'
import { UserRepository, FriendRequestRepository } from './repositories'
import { UserErrors } from './errors/user.errors'
import { UserEventsPublisher } from './publishers/user-events.publisher'
import {
  AuthSession,
  UserEntity,
  Friendship,
  FriendRequestDetail,
  UserProfile,
} from './domain/user.domain'
import type {
  UserRegisterRequest,
  UserLoginRequest,
  MakeFriendRequest,
  UpdateStatusRequest,
  UpdateProfileRequest,
} from 'interfaces/user.grpc'

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REDIS') private readonly redis: RedisClient,
    private readonly userRepo: UserRepository,
    private readonly friendRequestRepo: FriendRequestRepository,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(UtilService) private readonly utilService: UtilService,
    private readonly eventsPublisher: UserEventsPublisher,
    @Inject(StorageR2Service)
    private readonly storageR2Service: StorageR2Service,
  ) {}

  async register(data: UserRegisterRequest): Promise<UserEntity> {
    const existingUser = await this.userRepo.findByEmail(data.email)
    if (existingUser) {
      UserErrors.emailAlreadyExists()
    }

    const existingUsername = await this.userRepo.findByUsername(data.username)
    if (existingUsername) {
      UserErrors.usernameAlreadyExists()
    }

    const hashedPassword = await this.utilService.hashPassword(data.password)
    const { createdAt, updatedAt, password, ...user } =
      await this.userRepo.create({
        email: data.email,
        username: data.username,
        password: hashedPassword,
      })

    const userEntity: UserEntity = {
      ...user,
      createdAt,
      updatedAt,
    }

    this.eventsPublisher.publishUserCreated({
      id: userEntity.id,
      email: userEntity.email,
      username: userEntity.username,
    })

    return userEntity
  }

  async login(data: UserLoginRequest): Promise<AuthSession> {
    const user = await this.userRepo.findByEmail(data.email)
    if (!user) {
      UserErrors.userNotFound()
    }

    const token = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      username: user.username,
    })

    return {
      userId: user.id,
      ...user,
      token,
    }
  }

  async getUserById(userId: string): Promise<UserEntity> {
    const user = await this.userRepo.findByIdWithSelect(userId)
    if (!user) {
      UserErrors.userNotFound()
    }
    return user as UserEntity
  }

  async makeFriend(data: MakeFriendRequest): Promise<Friendship> {
    const friend = await this.userRepo.findByEmail(data.inviteeEmail)
    if (!friend) {
      UserErrors.friendNotFound()
    }

    const friendRequest = await this.friendRequestRepo.create({
      fromUserId: data.inviterId,
      toUserId: friend.id,
    })

    this.eventsPublisher.publishUserMakeFriend({
      friendRequestId: friendRequest.id,
      inviterId: data.inviterId,
      inviterName: data.inviterName,
      inviteeEmail: data.inviteeEmail,
      inviteeName: friend.username,
      inviteeId: friend.id,
    })

    return friendRequest
  }

  async updateStatusMakeFriend(data: UpdateStatusRequest): Promise<Friendship> {
    const friendRequest = await this.friendRequestRepo.findByUsers(
      data.inviterId,
      data.inviteeId,
    )

    if (!friendRequest) {
      UserErrors.friendRequestNotFound()
    }

    if (friendRequest.status !== Status.PENDING) {
      UserErrors.friendRequestAlreadyResponded()
    }

    await this.friendRequestRepo.updateStatus(
      data.inviterId,
      data.inviteeId,
      data.status as Status,
    )

    const updatedRequest = await this.friendRequestRepo.findByUsers(
      data.inviterId,
      data.inviteeId,
    )

    let inviterUpdate
    let inviteeUpdate

    if (data.status === Status.ACCEPTED) {
      await this.userRepo.updateFriends(data.inviterId, data.inviteeId)
      await this.userRepo.updateFriends(data.inviteeId, data.inviterId)
      inviterUpdate = await this.userRepo.findById(data.inviterId)
      inviteeUpdate = await this.userRepo.findById(data.inviteeId)
    }

    this.eventsPublisher.publishUserUpdateStatusMakeFriend({
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
    })

    return updatedRequest as Friendship
  }

  async listFriends(userId: string): Promise<UserEntity[]> {
    const user = await this.userRepo.findById(userId)
    if (!user) {
      UserErrors.userNotFound()
    }

    const friends = await this.userRepo.findManyByIds(user.friends || [])
    return friends as UserEntity[]
  }

  async detailMakeFriend(
    friendRequestId: string,
  ): Promise<FriendRequestDetail> {
    const friendRequest = await this.friendRequestRepo.findById(friendRequestId)
    if (!friendRequest) {
      UserErrors.friendRequestNotFound()
    }

    const fromUser = await this.userRepo.findByIdWithSelect(
      friendRequest.fromUserId,
    )

    return {
      ...friendRequest,
      fromUser: fromUser as any,
    }
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
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

    this.eventsPublisher.publishUserUpdated({
      userId: user.id,
      fullName: data.fullName || undefined,
      avatar: avatarUrl || undefined,
    })

    return {
      fullName: user.fullName,
      bio: user.bio,
      avatar: avatarUrl || user.avatar,
    }
  }
}
