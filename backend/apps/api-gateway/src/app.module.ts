import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { USER_PACKAGE_NAME, USER_SERVICE_NAME } from 'interfaces/user'
import { UserModule } from './user/user.module'
import { AuthGuard, CommonModule } from '@app/common'
import { APP_GUARD } from '@nestjs/core'
import { PORT_GRPC } from 'libs/constant/port-grpc.constant'
import { RealtimeGateway } from './realtime/realtime.gateway'

@Module({
  imports: [
    ClientsModule.register([
      {
        name: USER_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          package: USER_PACKAGE_NAME,
          protoPath: './proto/user.proto',
          url: `localhost:${PORT_GRPC.USER_GRPC_PORT}`,
        },
      },
    ]),
    UserModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    RealtimeGateway,
  ],
  exports: [ClientsModule],
})
export class AppModule {}
