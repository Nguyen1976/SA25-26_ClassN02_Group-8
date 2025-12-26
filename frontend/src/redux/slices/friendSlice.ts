import authorizeAxiosInstance from '@/utils/authorizeAxios'
import { API_ROOT } from '@/utils/constant'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface FriendState {
  friends: Array<{
    id: string
    email: string
    username: string
    avatar?: string
  }>
}

const initialState: FriendState = {
  friends: [],
}

export const getFriends = createAsyncThunk(`/user/list-friends`, async () => {
  const response = await authorizeAxiosInstance.get(
    `${API_ROOT}/user/list-friends`
  )
  return response.data.data
})

export const friendSlice = createSlice({
  name: 'friend',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      getFriends.fulfilled,
      (state, action: PayloadAction<FriendState>) => {
        state.friends = action.payload.friends
      }
    )
  },
})

export const selectFriend = (state: { friend: FriendState }) => {
  return state.friend
}

// export const {} = friendSlice.actions
export default friendSlice.reducer
