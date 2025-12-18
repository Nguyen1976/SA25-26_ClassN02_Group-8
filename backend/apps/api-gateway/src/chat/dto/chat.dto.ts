import { IsNotEmpty } from 'class-validator'

export class CreateConversationDTO {
  @IsNotEmpty()
  memberIds: string[]

  @IsNotEmpty()
  groupName: string

  groupAvatar?: string
}

export class AddMemberToConversationDTO {
  @IsNotEmpty({
    message: 'conversationId is required',
  })
  conversationId: string

  @IsNotEmpty({
    message: 'memberIds is required',
  })
  memberIds: string[]
}
