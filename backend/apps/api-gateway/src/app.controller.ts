import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject('USER_SERVICE')
  private userService: ClientProxy;
  @Get('users')
  async getHello(): Promise<any> {
    return this.userService.send('users', '');
  }
}
