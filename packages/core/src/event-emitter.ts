type Handler = (...args: any[]) => void

export class EventEmitter {
  private listeners = new Map<string, Set<Handler>>()

  on(event: string, handler: Handler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)
  }

  off(event: string, handler: Handler): void {
    this.listeners.get(event)?.delete(handler)
  }

  protected emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach((handler) => {
      try {
        handler(...args)
      } catch (e) {
        console.error(`[pocato] Error in ${event} handler:`, e)
      }
    })
  }

  protected removeAllListeners(): void {
    this.listeners.clear()
  }
}
