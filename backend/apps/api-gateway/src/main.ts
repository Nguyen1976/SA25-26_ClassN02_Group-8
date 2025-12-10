import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { GrpcToHttpExceptionFilter } from './common/filters/grpc-exception.filter'
import { ResponseInterceptor } from './common/interceptor/response.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  app.useGlobalFilters(new GrpcToHttpExceptionFilter())
  app.useGlobalInterceptors(new ResponseInterceptor())

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
