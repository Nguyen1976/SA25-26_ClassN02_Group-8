import { LoggerService } from '@app/logger'
import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  private readonly startTime = Date.now()

  constructor(private readonly logger: LoggerService) {}

  async getHealth() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000)
    const memUsage = process.memoryUsage()
    this.logger.info('Health check requested')
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime,
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024),
      },
      services: {
        notification: 'UP',
        user: 'UP',
        chat: 'UP',
      },
    }
  }
}
