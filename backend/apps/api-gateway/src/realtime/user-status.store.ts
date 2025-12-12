export class UserStatusStore {
  // Map userId -> Set socketIds
  private static users = new Map<string, Set<string>>()

  static addConnection(userId: string, socketId: string) {
    if (!this.users.has(userId)) {
      this.users.set(userId, new Set())
    }
    this.users.get(userId)?.add(socketId)
  }

  static removeConnection(userId: string, socketId: string) {
    if (!this.users.has(userId)) return

    const connections = this.users.get(userId)!
    connections.delete(socketId)

    if (connections.size === 0) {
      this.users.delete(userId)
    }
  }

  static isOnline(userId: string) {
    return this.users.has(userId)
  }

  static getOnlineUsers() {
    return [...this.users.keys()]
  }

  static getUserSockets(userId: string) {
    return this.users.get(userId) || new Set()
  }
}
