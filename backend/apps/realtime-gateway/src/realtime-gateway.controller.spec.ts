import { Test, TestingModule } from '@nestjs/testing';
import { RealtimeGatewayController } from './realtime-gateway.controller';
import { RealtimeGatewayService } from './realtime-gateway.service';

describe('RealtimeGatewayController', () => {
  let realtimeGatewayController: RealtimeGatewayController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RealtimeGatewayController],
      providers: [RealtimeGatewayService],
    }).compile();

    realtimeGatewayController = app.get<RealtimeGatewayController>(RealtimeGatewayController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(realtimeGatewayController.getHello()).toBe('Hello World!');
    });
  });
});
