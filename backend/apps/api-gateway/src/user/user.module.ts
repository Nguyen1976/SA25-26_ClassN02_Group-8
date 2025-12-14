import { forwardRef, Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { AppModule } from '../app.module'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { USER_GRPC_SERVICE_NAME, USER_PACKAGE_NAME } from 'interfaces/user.grpc'
import { PORT_GRPC } from 'libs/constant/port-grpc.constant'
@Module({
  imports: [
    forwardRef(() => AppModule),
    ClientsModule.register([
      {
        name: USER_GRPC_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          package: USER_PACKAGE_NAME,
          protoPath: './proto/user.grpc.proto',
          url: `localhost:${PORT_GRPC.USER_GRPC_PORT}`,
        },
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
