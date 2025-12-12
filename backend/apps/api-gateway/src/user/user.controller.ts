import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { UserService } from './user.service'
import { LoginUserDto, MakeFriendDto, RegisterUserDto } from './dto/user.dto'
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
  async makeFriend(
    @Body() body: MakeFriendDto,
    @UserInfo('userId') userId: string,
  ) {
    return await this.userService.makeFriend({userId, friendEmail: body.email})
  }
}
