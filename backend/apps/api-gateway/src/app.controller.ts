import { Controller, Get, Inject, OnModuleInit } from '@nestjs/common'
import { AppService } from './app.service'
import type { ClientGrpc } from '@nestjs/microservices'
import { User, USER_SERVICE_NAME, UserServiceClient } from 'interfaces/user'
import { lastValueFrom, Observable } from 'rxjs'

@Controller()
export class AppController implements OnModuleInit {
  private userService: UserServiceClient
  constructor(
    private readonly appService: AppService,
    @Inject(USER_SERVICE_NAME) private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.userService =
      this.client.getService<UserServiceClient>(USER_SERVICE_NAME)
  }

  @Get('user')
  async getHello(): Promise<User> {
    const obs$ = this.userService.getUser({ id: '1' })
    return await lastValueFrom(obs$)
  }
}
