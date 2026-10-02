export class EventBus {
  constructor() {
    this.listeners = new Set();
  }

  on(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async emit(event) {
    for (const listener of this.listeners) {
      await listener(event);
    }
  }
}
