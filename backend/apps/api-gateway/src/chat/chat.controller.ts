import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import {
  AddMemberToConversationDTO,
  CreateConversationDTO,
} from './dto/chat.dto'
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
   */

  @Get('conversations')
  @RequireLogin()
  async getConversations(
    @UserInfo() userInfo: any,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const params = {
      limit: limit ? parseInt(limit, 10) : 20,
      page: page ? parseInt(page, 10) : 1,
    }

    const res = await this.chatService.getConversations(userInfo.userId, params)

    return res
  }

  @Get('messages/:conversationId')
  @RequireLogin()
  async getMessagesByConversationId(
    @Param('conversationId') conversationId: string,
    @UserInfo() userInfo: any,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const params = {
      limit: limit ? parseInt(limit, 10) : 20,
      page: page ? parseInt(page, 10) : 1,
    }
    const res = await this.chatService.getMessagesByConversationId(
      conversationId,
      userInfo.userId,
      params,
    )
    return res
  }
}
