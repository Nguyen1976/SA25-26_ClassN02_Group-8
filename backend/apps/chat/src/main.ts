import { NestFactory } from '@nestjs/core'
import { ChatModule } from './chat.module'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { CHAT_PACKAGE_NAME } from 'interfaces/chat.grpc'
import { PORT_GRPC } from 'libs/constant/grpc/port-grpc.constant'

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ChatModule,
    {
      transport: Transport.GRPC,
      options: {
        package: CHAT_PACKAGE_NAME,
        protoPath: './proto/chat.grpc.proto',
        url: `localhost:${PORT_GRPC.CHAT_GRPC_PORT}`,
      },
    },
  )
  await app.listen()
}
bootstrap()
