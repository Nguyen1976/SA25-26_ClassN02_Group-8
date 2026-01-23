import { NestFactory } from '@nestjs/core';
import { RealtimeGatewayModule } from './realtime-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(RealtimeGatewayModule);
  await app.listen(process.env.port ?? 3001);
}
bootstrap();
