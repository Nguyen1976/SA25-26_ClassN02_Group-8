import {
  UserRegisterResponse,
  UserLoginResponse,
  GetUserByIdResponse,
  MakeFriendResponse,
  UpdateStatusResponse,
  ListFriendsResponse,
  DetailMakeFriendResponse,
  UpdateProfileResponse,
} from 'interfaces/user.grpc'
import {
  AuthSession,
  UserEntity,
  Friendship,
  FriendRequestDetail,
  UserProfile,
} from './user.domain'

export class UserMapper {
  static toRegisterResponse(user: UserEntity): UserRegisterResponse {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
    }
  }

  static toLoginResponse(session: AuthSession): UserLoginResponse {
    return {
      id: session.userId,
      email: session.email,
      username: session.username,
      fullName: session.fullName || '',
      avatar: session.avatar || '',
      bio: session.bio || '',
      token: session.token,
    }
  }

  static toGetUserByIdResponse(user: UserEntity): GetUserByIdResponse {
    return {
      email: user.email,
      username: user.username,
      fullName: user.fullName || '',
      avatar: user.avatar || '',
      bio: user.bio || '',
    }
  }

  static toMakeFriendResponse(_friendship: Friendship): MakeFriendResponse {
    return {
      status: 'SUCCESS',
    }
  }

  static toUpdateStatusResponse(_friendship: Friendship): UpdateStatusResponse {
    return {
      status: 'SUCCESS',
    }
  }

  static toListFriendsResponse(friends: UserEntity[]): ListFriendsResponse {
    return {
      friends: friends.map((friend) => ({
        id: friend.id,
        email: friend.email,
        username: friend.username,
        fullName: friend.fullName || '',
        avatar: friend.avatar || '',
        bio: friend.bio || '',
      })),
    }
  }

  static toDetailMakeFriendResponse(
    friendRequest: FriendRequestDetail,
  ): DetailMakeFriendResponse {
    return {
      id: friendRequest.id,
      toUserId: friendRequest.toUserId,
      status: friendRequest.status,
      createdAt: friendRequest.createdAt.toString(),
      updatedAt: friendRequest.updatedAt.toString(),
      fromUser: {
        id: friendRequest.fromUser.id,
        email: friendRequest.fromUser.email,
        username: friendRequest.fromUser.username,
        fullName: friendRequest.fromUser.fullName || '',
        avatar: friendRequest.fromUser.avatar || '',
      },
    }
  }

  static toUpdateProfileResponse(profile: UserProfile): UpdateProfileResponse {
    return {
      fullName: profile.fullName || '',
      bio: profile.bio || '',
      avatar: profile.avatar || '',
    }
  }
}
