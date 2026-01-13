import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'
import { RateLimit } from './common/decorators/rate-limit.decorator'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('health')
  @RateLimit({ limit: 10, ttl: 60 })
  async getHealth() {
    return await this.appService.getHealth()
  }
}
