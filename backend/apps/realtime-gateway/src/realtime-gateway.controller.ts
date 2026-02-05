import { Controller, Get } from '@nestjs/common'
import { RealtimeGatewayService } from './realtime-gateway.service'

@Controller()
export class RealtimeGatewayController {
  constructor(
    private readonly realtimeGatewayService: RealtimeGatewayService,
  ) {}

  @Get()
  getHello(): string {
    return this.realtimeGatewayService.getHello()
  }
}
