import { v4 as uuid } from 'uuid'

export function traceMiddleware(req, res, next) {
  req.traceId = req.headers['x-trace-id'] || uuid()
  res.setHeader('x-trace-id', req.traceId)
  next()
}
