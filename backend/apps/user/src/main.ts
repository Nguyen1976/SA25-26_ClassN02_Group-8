import { NestFactory } from '@nestjs/core'
import { UserModule } from './user.module'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { USER_PACKAGE_NAME } from 'interfaces/user.grpc'
import { PORT_GRPC } from 'libs/constant/grpc/port-grpc.constant'

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserModule,
    {
      transport: Transport.GRPC,
      options: {
        package: USER_PACKAGE_NAME,
        protoPath: './proto/user.grpc.proto',
        url: `localhost:${PORT_GRPC.USER_GRPC_PORT}`,
      },
    },
  )
  await app.listen()
}
bootstrap()
