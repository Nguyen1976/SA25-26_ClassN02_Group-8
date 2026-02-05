import {
  CreateConversationResponse,
  GetConversationsResponse,
} from 'interfaces/chat.grpc'

export class ConversationMapper {
  // Add mapping methods here as needed

  static toGetConversationsResponse(
    conversations,
    unreadMap: Map<string, string>,
  ): GetConversationsResponse {
    return {
      conversations: conversations.map((c) => ({
        id: c.id,
        type: c.type,
        groupName: c.groupName,
        groupAvatar: c.groupAvatar,
        unreadCount: unreadMap.get(c.id) ?? '0',
        createdAt: c.createdAt.toString(),
        updatedAt: c.updatedAt.toString(),
        members: c.members.map((m) => ({
          ...m,
          userId: m.userId,
          username: m.username,
          avatar: m.avatar,
          fullName: m.fullName,
          lastReadAt: m.lastReadAt ? m.lastReadAt.toString() : null,
          lastMessageAt: m.lastMessageAt.toString(),
        })),
        lastMessage: c.messages.length
          ? {
              ...c.messages[0],
              createdAt: c.messages[0].createdAt.toString(),
            }
          : null,
      })),
    } as GetConversationsResponse
  }

  static toCreateConversationResponse(res: any): CreateConversationResponse {
    return this.formatConversationResponse(res)
  }

  // Private helper methods
  static formatConversationResponse(res: any): CreateConversationResponse {
    return {
      conversation: {
        id: res?.id,
        unreadCount: '0',
        type: res?.type,
        groupName: res?.groupName,
        groupAvatar: res?.groupAvatar,
        createdAt: res?.createdAt.toString(),
        updatedAt: res?.updatedAt.toString(),
        members: res?.members.map((m: any) => ({
          ...m,
          lastReadAt: m.lastReadAt ? m.lastReadAt.toString() : '',
        })),
        messages:
          res?.messages?.map((msg: any) => ({
            ...msg,
            createdAt: msg.createdAt.toString(),
          })) || [],
      },
    } as CreateConversationResponse
  }
}
