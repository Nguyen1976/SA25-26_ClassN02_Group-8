import { io, Socket } from 'socket.io-client'

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001/realtime'

export const socket: Socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: false,
  auth: {
    token: localStorage.getItem('token'),
  },
})
