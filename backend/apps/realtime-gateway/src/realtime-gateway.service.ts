import { Injectable } from '@nestjs/common';

@Injectable()
export class RealtimeGatewayService {
  getHello(): string {
    return 'Hello World!';
  }
}
