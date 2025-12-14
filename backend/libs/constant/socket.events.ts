export const SOCKET_EVENTS = {
  CONNECTION: 'user_online',
  DISCONNECTION: 'user_offline',

  CHAT: {
    SEND_MESSAGE: 'chat.send_message', //emit
    NEW_MESSAGE: 'chat.new_message', //listen
    NEW_CONVERSATION: 'chat.new_conversation', //listen
  },

  USER: {
    UPDATE_FRIEND_REQUEST_STATUS: 'user.update_friend_request_status', //listen
    NEW_FRIEND_REQUEST: 'user.new_friend_request', //listen
  },
}
