import authorizeAxiosInstance from '@/utils/authorizeAxios'
import { API_ROOT } from '@/utils/constant'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface Notification {
  id: string
  userId: string
  message: string
  isRead: boolean
  type: string
  friendRequestId?: string | undefined
  createdAt: string
}

export type NotificationState = Notification[]

const initialState: NotificationState = []

export const getNotifications = createAsyncThunk(
  `/notification`,
  async ({ limit, page }: { limit: number; page: number }) => {
    const response = await authorizeAxiosInstance.get(
      `${API_ROOT}/notification?limit=${limit}&page=${page}`
    )
    return response.data.data
  }
)

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.unshift(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      getNotifications.fulfilled,
      (state, action: PayloadAction<{ notifications: NotificationState }>) => {
        state = action.payload.notifications || []
        return state
      }
    )
  },
})

export const selectNotification = (state: {
  notification: NotificationState
}) => {
  return state.notification
}

export const { addNotification } = notificationSlice.actions
export default notificationSlice.reducer
