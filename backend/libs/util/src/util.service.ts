import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class UtilService {
  async hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 10)
    return hash
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, hash)
    return isMatch
  }

  dateToTimestamp = (date: Date) => ({
    seconds: Math.floor(date.getTime() / 1000),
    nanos: (date.getTime() % 1000) * 1e6,
  })
}
