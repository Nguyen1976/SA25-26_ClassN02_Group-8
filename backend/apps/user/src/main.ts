import { NestFactory } from '@nestjs/core'
import { UserModule } from './user.module'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { USER_PACKAGE_NAME } from 'interfaces/user'

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserModule,
    {
      transport: Transport.GRPC,
      options: {
        package: USER_PACKAGE_NAME,
        protoPath: './proto/user.proto',
        url: 'localhost:50051',
      },
    },
  )
  await app.listen()
}
bootstrap()
