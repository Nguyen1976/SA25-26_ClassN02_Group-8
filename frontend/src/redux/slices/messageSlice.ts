import authorizeAxiosInstance from '@/utils/authorizeAxios'
import { API_ROOT } from '@/utils/constant'
import {
  createAsyncThunk,
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import type { RootState } from '../store'

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
  isDeleted?: boolean
  deleteType?: string
  createdAt?: string
  senderMember?: SenderMember | undefined
  status?: 'sent' | 'pending'
}

export interface MessageState {
  messages: Record<string, Message[]>
}

const initialState: MessageState = {
  messages: {},
}

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

export const sendMessage = createAsyncThunk(
  `/chat/send-message`,
  async ({
    conversationId,
    message,
    tempMessageId,
  }: {
    conversationId: string
    message: string
    tempMessageId?: string
  }) => {
    const response = await authorizeAxiosInstance.post(
      `${API_ROOT}/chat/send_message`,
      { conversationId, message }
    )
    return { ...response.data.data, tempMessageId }
  }
)

export const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload
      if (!state.messages[message.conversationId]) {
        state.messages[message.conversationId] = []
      }
      state.messages[message.conversationId].unshift(message)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      getMessages.fulfilled,
      (state, action: PayloadAction<{ messages: Message[] }>) => {
        const { messages } = action.payload
        const conversationId = messages[0]?.conversationId
        if (!state.messages[conversationId || '']) {
          state.messages[conversationId || ''] = []
        }
        state.messages[conversationId || ''] = [
          ...messages,
          ...state.messages[conversationId || ''],
        ]
      }
    )
    builder.addCase(
      sendMessage.fulfilled,
      (
        state,
        action: PayloadAction<{ message: Message; tempMessageId?: string }>
      ) => {
        const { message, tempMessageId } = action.payload

        if (!state.messages[message.conversationId]) {
          state.messages[message.conversationId] = []
        }
        if (tempMessageId) {
          const index = state.messages[message.conversationId].findIndex(
            (m) => m.id === tempMessageId
          )
          if (index !== -1) {
            state.messages[message.conversationId][index] = {
              ...message,
              status: 'sent',
            }
            return
          }
        }
        state.messages[message.conversationId].unshift({
          ...message,
          status: 'sent',
        })
      }
    )
  },
})

export const selectMessage = createSelector(
  [
    (state: RootState) => state.message.messages,
    (_: RootState, conversationId?: string) => conversationId,
  ],
  (messagesMap, conversationId) => {
    if (!conversationId) return []
    const messages = messagesMap[conversationId]
    if (!messages) return []

    return [...messages].reverse()
  }
)

export const { addMessage } = messageSlice.actions
export default messageSlice.reducer
