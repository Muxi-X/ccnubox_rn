/**
 * Event listener function type
 */
type EventListener<T extends unknown[] = unknown[]> = (...args: T) => void;

/**
 * 使用 WeakMap 实现 EventBus，可解决内存泄漏问题，但我还没测试过
 */
export class EventBusTest {
  private _eventPool: WeakMap<object, Map<string, EventListener[]>>;

  constructor() {
    this._eventPool = new WeakMap();
  }

  private getEventListeners(): Map<string, EventListener[]> {
    const eventFns = this._eventPool.get(globalThis);
    if (!eventFns) {
      const newEventFns = new Map<string, EventListener[]>();
      this._eventPool.set(globalThis, newEventFns);
      return newEventFns;
    }
    return eventFns;
  }

  emit<T extends unknown[]>(name: string, ...args: T): void {
    const eventFns = this.getEventListeners();
    const listeners = eventFns.get(name);
    if (listeners instanceof Array) {
      listeners.forEach(fn => fn(...args));
    } else {
      throw new Error(`没有名为 ${name} 的事件`);
    }
  }

  on<T extends unknown[]>(name: string, fn: EventListener<T>): void {
    const eventFns = this.getEventListeners();
    if (!eventFns.has(name)) {
      eventFns.set(name, []);
    }
    const listeners = eventFns.get(name)!;
    listeners.push(fn as EventListener);
  }

  off<T extends unknown[]>(name: string, fn: EventListener<T>): void {
    const eventFns = this.getEventListeners();
    if (!eventFns.has(name)) {
      throw new Error(`${name} 中不存在该函数`);
    }
    const listeners = eventFns.get(name)!;
    const index = listeners.indexOf(fn as EventListener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  once<T extends unknown[]>(name: string, fn: EventListener<T>): void {
    const onceFn: EventListener<T> = (...args: T) => {
      fn(...args);
      this.off(name, onceFn);
    };
    this.on(name, onceFn);
  }
}

export class EventBus {
  private _eventPool: Record<string, EventListener[]> = {};

  emit<T extends unknown[]>(name: string, ...args: T): void {
    if (this._eventPool[name] instanceof Array) {
      this._eventPool[name].forEach(fn => fn(...args));
      return;
    }
    console.log(`没有名为 ${name} 的事件`);
  }

  on<T extends unknown[]>(name: string, fn: EventListener<T>): void {
    if (!this._eventPool[name]) {
      this._eventPool[name] = [];
    }
    this._eventPool[name].push(fn as EventListener);
  }

  off<T extends unknown[]>(name: string, fn: EventListener<T>): void {
    if (!this._eventPool[name]) {
      throw new Error(`${name} 中不存在该函数`);
    }
    const index = this._eventPool[name].indexOf(fn as EventListener);
    if (index > -1) {
      this._eventPool[name].splice(index, 1);
    }
  }

  once<T extends unknown[]>(name: string, fn: EventListener<T>): void {
    const onceFn: EventListener<T> = (...args: T) => {
      fn(...args);
      this.off(name, onceFn);
    };
    this.on(name, onceFn);
  }
}

/**
 * 全局事件总线
 */
const globalEventBus = new EventBus();

export default globalEventBus;
