type EventHandler = (...args: unknown[]) => void;

class GameEventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  on(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  off(event: string, handler: EventHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  emit(event: string, ...args: unknown[]): void {
    this.handlers.get(event)?.forEach((handler) => {
      try {
        handler(...args);
      } catch (err) {
        console.error(`[GameEventBus] Error in handler for "${event}":`, err);
      }
    });
  }

  once(event: string, handler: EventHandler): void {
    const wrapper: EventHandler = (...args) => {
      this.off(event, wrapper);
      handler(...args);
    };
    this.on(event, wrapper);
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.handlers.delete(event);
    } else {
      this.handlers.clear();
    }
  }
}

export const gameEventBus = new GameEventBus();

/*
 * Event catalogue — used by Phaser scenes & React components
 *
 * Phaser → React (outbound from game engine):
 *   "local-player-moved"    { x, y, tileX, tileY }
 *   "zone-entered"          { zoneId }
 *   "zone-exited"           {}
 *   "scene-ready"           {}
 *
 * React → Phaser (inbound to game engine):
 *   "remote-player-update"  { sessionId, x, y, direction, animation, name }
 *   "remote-player-add"     { sessionId, name, x, y }
 *   "remote-player-remove"  { sessionId }
 *   "set-target-fps"        { fps }
 *   "position-rollback"     { x, y }
 */
