import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { status } from '@grpc/grpc-js'
import { RpcException } from '@nestjs/microservices'

@Catch()
export class GrpcToHttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    // Giả sử host là HTTP (Gateway expose HTTP)
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      return response.status(status).json(exception.getResponse())
    }

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'Internal server error'

    if (exception?.code !== undefined && exception?.details !== undefined) {
      // Đây là gRPC error
      switch (exception.code) {
        case status.NOT_FOUND:
          httpStatus = HttpStatus.NOT_FOUND
          break
        case status.INVALID_ARGUMENT:
          httpStatus = HttpStatus.BAD_REQUEST
          break
        case status.ALREADY_EXISTS:
          httpStatus = HttpStatus.CONFLICT
          break
        case status.UNAVAILABLE:
          httpStatus = HttpStatus.SERVICE_UNAVAILABLE
          break
        case status.DEADLINE_EXCEEDED:
          httpStatus = HttpStatus.GATEWAY_TIMEOUT
          break
        default:
          httpStatus = HttpStatus.INTERNAL_SERVER_ERROR
      }
      message = exception.details
    }

    response.status(httpStatus).json({
      statusCode: httpStatus,
      message,
    })
  }
}
