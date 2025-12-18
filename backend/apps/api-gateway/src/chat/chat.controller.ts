import { Body, Controller, Post } from '@nestjs/common'
import { AddMemberToConversationDTO, CreateConversationDTO } from './dto/chat.dto'
import { ChatService } from './chat.service'
import { RequireLogin, UserInfo } from '@app/common/common.decorator'
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('create')
  @RequireLogin()
  async createConversation(
    @Body() createConversationDto: CreateConversationDTO,
    @UserInfo() userInfo: any,
  ) {
    return await this.chatService.createConversation({
      ...createConversationDto,
      type: 'GROUP',
      memberIds: [...(createConversationDto.memberIds || []), userInfo.userId],
      createrId: userInfo.userId,
    })
  }

  //mai sẽ làm chức năng add member sau
  @Post('add-member')
  @RequireLogin()
  async addMemberToConversation(
    @Body() body: AddMemberToConversationDTO,
    @UserInfo() userInfo: any,
  ) {
    return await this.chatService.addMemberToConversation(body)
  }
  //luồng hoạt động của add member
  //khi thêm 1 member vào conversation đảm bảo check đó phải có type là group
  /**gateway call frpc chat service
   * add member
   * publish sự kiện có member mới và rabbitmq
   * realtime gateway lawnsng nghe sự kiện và push conversation về cho member
   * done
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   */




}
