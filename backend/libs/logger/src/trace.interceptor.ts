import { Injectable, Logger, NestInterceptor } from "@nestjs/common"
import { tap } from "rxjs/internal/operators/tap"

@Injectable()
export class TraceInterceptor implements NestInterceptor {
  constructor(private logger: Logger) {}

  intercept(ctx, next) {
    const req = ctx.switchToHttp().getRequest()
    const start = Date.now()

    return next.handle().pipe(
      tap(() => {
        this.logger.log({
          traceId: req.traceId,
          path: req.url,
          method: req.method,
          userId: req.user?.id,
          latency: Date.now() - start,
        })
      }),
    )
  }
}
