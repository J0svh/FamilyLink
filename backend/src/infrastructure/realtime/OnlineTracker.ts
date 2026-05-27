export class OnlineTracker {
  private connections: Map<string, Set<string>> = new Map();

  addConnection(userId: string, socketId: string): void {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(socketId);
  }

  removeConnection(userId: string, socketId: string): boolean {
    const sockets = this.connections.get(userId);
    if (!sockets) return false;
    sockets.delete(socketId);
    if (sockets.size === 0) {
      this.connections.delete(userId);
      return true; // user went fully offline
    }
    return false; // still has other connections
  }

  isOnline(userId: string): boolean {
    return this.connections.has(userId) && this.connections.get(userId)!.size > 0;
  }

  getOnlineUserIds(): string[] {
    return Array.from(this.connections.keys());
  }
}
