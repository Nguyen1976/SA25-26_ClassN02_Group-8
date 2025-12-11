import { DynamicModule, Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'

@Module({})
export class RmqModule {
  static registerClient(
    name: string,
    queue: string,
    exchange?: string,
  ): DynamicModule {
    return {
      module: RmqModule,
      imports: [
        ClientsModule.register([
          {
            name,
            transport: Transport.RMQ,
            options: {
              urls: [process.env.RABBITMQ_URI || 'amqp://localhost:5672'],
              queue,
              queueOptions: { durable: true },
              exchange,
              persistent: true,
            },
          },
        ]),
      ],
      exports: [ClientsModule],
    }
  }
}
