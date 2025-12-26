export interface UserCreatedPayload {
  id: string
  email: string
  username: string
}

export interface UserMakeFriendPayload {
  inviterId: string
  inviterName: string

  inviteeEmail: string
  inviteeName: string
  inviteeId: string
}

export interface UserUpdateStatusMakeFriendPayload {
  inviterId: string //ngươi nhận thông báo
  inviteeId: string
  inviteeName: string
  status: string
  members: { userId: string; username: string; avatar: string }[]
}

export interface SendMessagePayload {
  conversationId: string
  senderId: string
  message: string
  replyToMessageId?: string
}

export interface MemberAddedToConversationPayload {
  conversationId: string
  newMemberIds: string[]
}