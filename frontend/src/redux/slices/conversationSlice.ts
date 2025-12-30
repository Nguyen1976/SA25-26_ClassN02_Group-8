import authorizeAxiosInstance from '@/utils/authorizeAxios'
import { API_ROOT } from '@/utils/constant'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

export interface SenderMember {
  userId: string
  username: string
  avatar: string
}

export interface Message {
  id?: string
  conversationId: string
  senderId: string
  text: string
  replyToMessageId?: string | undefined
  isDeleted?: boolean
  deleteType?: string
  createdAt?: string
  senderMember: SenderMember | undefined
}

export interface ConversationMember {
  userId: string
  /** timestamp (ms) */
  lastReadAt?: string
  username?: string
  avatar?: string
}

export interface Conversation {
  id: string
  type: string
  unreadCount?: string
  groupName?: string | undefined
  groupAvatar?: string | undefined
  createdAt: string
  updatedAt?: string | undefined
  members: ConversationMember[]
  lastMessage: Message | null
}

export type ConversationState = Conversation[]

const initialState: ConversationState = []

export const getConversations = createAsyncThunk(
  `/chat/conversations`,
  async (
    { limit = 10, page = 1 }: { limit: number; page: number },
    { getState }
  ) => {
    const state = getState() as RootState
    const userId = state.user.id

    const response = await authorizeAxiosInstance.get(
      `${API_ROOT}/chat/conversations?limit=${limit}&page=${page}`
    )
    return { userId, conversations: response.data.data.conversations }
  }
)

// export const getMessages = createAsyncThunk(
//   `/chat/messages`,
//   async ({
//     conversationId,
//     limit = 20,
//     page = 1,
//   }: {
//     conversationId: string
//     limit?: number
//     page?: number
//   }) => {
//     const response = await authorizeAxiosInstance.get(
//       `${API_ROOT}/chat/messages/${conversationId}?limit=${limit}&page=${page}`
//     )
//     return response.data.data
//   }
// )

export const createConversation = createAsyncThunk(
  `/chat/create`,
  async ({
    members,
    groupName,
  }: {
    members: ConversationMember[]
    groupName?: string
  }) => {
    const response = await authorizeAxiosInstance.post(
      `${API_ROOT}/chat/create`,
      {
        members,
        groupName,
      }
    )
    return response.data.data
  }
)

export const conversationSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    addConversation: (
      state,
      action: PayloadAction<{ conversation: Conversation; userId: string }>
    ) => {
      const { conversation, userId } = action.payload
      state.unshift({
        ...conversation,
        groupName:
          conversation.type === 'DIRECT'
            ? conversation.members.find(
                (p: ConversationMember) => p.userId !== userId
              )?.username || ''
            : conversation.groupName,
        groupAvatar:
          conversation.type === 'DIRECT'
            ? conversation.members.find(
                (p: ConversationMember) => p.userId !== userId
              )?.avatar || ''
            : conversation.groupAvatar,
        lastMessage:
          conversation.lastMessage !== undefined
            ? conversation.lastMessage
            : null,
      })
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        getConversations.fulfilled,
        (
          state: ConversationState,
          action: PayloadAction<{
            conversations: Conversation[]
            userId: string
          }>
        ) => {
          const { conversations, userId } = action.payload
          const oldState = state || []
          state = [
            ...oldState,
            ...(conversations?.map((c) => ({
              ...c,
              groupName:
                c.type === 'DIRECT'
                  ? c.members.find(
                      (p: ConversationMember) => p.userId !== userId
                    )?.username || ''
                  : c.groupName,
              groupAvatar:
                c.type === 'DIRECT'
                  ? c.members.find(
                      (p: ConversationMember) => p.userId !== userId
                    )?.avatar || ''
                  : c.groupAvatar,
              lastMessage: c.lastMessage !== undefined ? c.lastMessage : null,
            })) as Conversation[]),
          ]
          return state
        }
      )
      // .addCase(
      //   getMessages.fulfilled,
      //   (
      //     state,
      //     action: PayloadAction<{ messages: Message[]; conversationId: string }>
      //   ) => {
      //     const { messages, conversationId } = action.payload
      //     const conversation = state?.find((c) => c.id === conversationId)
      //     if (conversation) {
      //       conversation.lastMessage =
      //         messages.length > 0 ? messages[messages.length - 1] : null
      //     }
      //   }
      // )
      .addCase(
        createConversation.fulfilled,
        (state, action: PayloadAction<{ conversation: Conversation }>) => {
          const c = action.payload.conversation

          state.unshift({
            ...c,
            lastMessage: c.lastMessage !== undefined ? c.lastMessage : null,
          })
        }
      )
  },
})

export const selectConversation = (state: {
  conversations: ConversationState
}): Conversation[] => {
  return state.conversations ?? []
}

export const selectMessagesByConversationId = (
  state: {
    conversations: ConversationState
  },
  conversationId: string
) => {
  const conversation = state.conversations?.find((c) => c.id === conversationId)
  return conversation ? conversation.lastMessage : null
}

export const { addConversation } = conversationSlice.actions
export default conversationSlice.reducer
