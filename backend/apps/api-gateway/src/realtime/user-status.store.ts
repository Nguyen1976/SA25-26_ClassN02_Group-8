

export class UserStatusStore {
  // Map userId -> Set socketIds

  constructor(private redisClient: any) {}
  private getKey(userId: string) {
    return `user:${userId}:sockets`
  }

  async addConnection(userId: string, socketId: string) {
    await this.redisClient.sadd(this.getKey(userId), socketId)
  }

  async removeConnection(userId: string, socketId: string) {
    const key = this.getKey(userId)

    await this.redisClient.srem(key, socketId)

    const count = await this.redisClient.scard(key)
    if (count === 0) {
      await this.redisClient.del(key)
    }
  }

  async isOnline(userId: string): Promise<boolean> {
    return (await this.redisClient.exists(this.getKey(userId))) === 1
  }

  async getUserSockets(userId: string): Promise<string[]> {
    return this.redisClient.smembers(this.getKey(userId))
  }

  async getOnlineUsers(): Promise<string[]> {
    const keys = await this.redisClient.keys('user:*:sockets')
    return keys.map((k) => k.split(':')[1])
  }
}
