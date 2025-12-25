import authorizeAxiosInstance from '@/utils/authorizeAxios'
import { API_ROOT } from '@/utils/constant'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface SenderMember {
  userId: string
  username: string
  avatar: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  text: string
  replyToMessageId?: string | undefined
  isDeleted: boolean
  deleteType: string
  createdAt: string
  senderMember: SenderMember | undefined
}

export interface ConversationMember {
  userId: string
  /** timestamp (ms) */
  lastReadAt?: string | undefined
  username?: string | undefined
  avatar?: string | undefined
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
  messages: Message[]
}

export interface ConversationState {
  conversations?: Array<Conversation>
}

const initialState: ConversationState = {
  conversations: [],
}

export const getConversations = createAsyncThunk(
  `/chat/conversations`,
  async ({ limit = 10, page = 1 }: { limit: number; page: number }) => {
    const response = await authorizeAxiosInstance.get(
      `${API_ROOT}/chat/conversations?limit=${limit}&page=${page}`
    )
    return response.data.data
  }
)

export const getMessages = createAsyncThunk(
  `/chat/messages`,
  async ({
    conversationId,
    limit = 20,
    page = 1,
  }: {
    conversationId: string
    limit?: number
    page?: number
  }) => {
    const response = await authorizeAxiosInstance.get(
      `${API_ROOT}/chat/messages/${conversationId}?limit=${limit}&page=${page}`
    )
    return response.data.data
  }
)

export const conversationSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(
        getConversations.fulfilled,
        (state, action: PayloadAction<ConversationState>) => {
          state.conversations = action.payload.conversations
        }
      )
      .addCase(
        getMessages.fulfilled,
        (
          state,
          action: PayloadAction<{ messages: Message[]; conversationId: string }>
        ) => {
          const { messages, conversationId } = action.payload
          const conversation = state.conversations?.find(
            (c) => c.id === conversationId
          )
          if (conversation) {
            conversation.messages = messages
          }
        }
      )
  },
})

export const selectConversation = (state: {
  conversations: ConversationState
}) => {
  return state.conversations
}

export const selectMessagesByConversationId = (
  state: {
    conversations: ConversationState
  },
  conversationId: string
) => {
  const conversation = state.conversations.conversations?.find(
    (c) => c.id === conversationId
  )
  return conversation ? conversation.messages : []
}

// export const {} = friendSlice.actions
export default conversationSlice.reducer
