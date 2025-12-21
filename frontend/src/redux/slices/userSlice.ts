import authorizeAxiosInstance from '@/utils/authorizeAxios'
import { API_ROOT } from '@/utils/constant'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface UserState {
  id: string
  email: string
  username: string
  token?: string
}

const initialState: UserState = {
  id: '',
  email: '',
  username: '',
}

export const loginAPI = createAsyncThunk(
  `/user/login`,
  async (data: { email: string; password: string }) => {
    const response = await authorizeAxiosInstance.post(
      `${API_ROOT}/user/login`,
      data
    )
    return response.data.data
  }
)

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      loginAPI.fulfilled,
      (state, action: PayloadAction<UserState>) => {
        const { token, ...user } = action.payload
        localStorage.setItem('token', token!)
        Object.assign(state, user)
      }
    )
  },
})

export const selectUser = (state: UserState) => {
  return state
}

// export const {} = userSlice.actions
export default userSlice.reducer
