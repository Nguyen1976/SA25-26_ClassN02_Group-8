// libs/logger/src/logger.service.ts
import { Inject, Injectable } from '@nestjs/common'

@Injectable()
export class LoggerService {
  constructor(
    @Inject('WINSTON_LOGGER')
    private readonly logger,
  ) {}

  info(msg: string) {
    this.logger.info(msg)
  }

  error(msg: string, trace?: string) {
    this.logger.error(msg + (trace ? ` | ${trace}` : ''))
  }
}
