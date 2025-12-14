import {
  Controller,
  Post,
  Body,
} from '@nestjs/common'
import { UserService } from './user.service'
import {
  LoginUserDto,
  MakeFriendDto,
  RegisterUserDto,
  UpdateStatusMakeFriendDto,
} from './dto/user.dto'
import { RequireLogin, UserInfo } from '@app/common/common.decorator'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return await this.userService.register(registerUserDto)
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return await this.userService.login(loginUserDto)
  }

  @Post('make-friend')
  @RequireLogin()
  async makeFriend(@Body() body: MakeFriendDto, @UserInfo() user: any) {
    return await this.userService.makeFriend({
      inviterId: user.userId,
      inviterName: user.username,
      inviteeEmail: body.email,
    })
  }

  @Post('update-status-make-friend')
  @RequireLogin()
  async updateStatusMakeFriend(
    @Body() body: UpdateStatusMakeFriendDto,
    @UserInfo() user: any,
  ) {
    return await this.userService.updateStatusMakeFriend({
      ...body,
      inviteeId: user.userId,
      inviteeName: user.username,
    })
  }
}
