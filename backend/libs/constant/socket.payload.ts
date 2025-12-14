export interface SendMessagePayload {
  conversationId: string
  message: string
  replyToMessageId?: string
  memberIds: string[]
}
