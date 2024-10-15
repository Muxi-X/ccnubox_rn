export class EventBus {
  _eventPool: Record<string, (() => void)[]> = {};
  emit(name: string) {
    if (this._eventPool[name] instanceof Array) {
      this._eventPool[name].forEach(fn => fn());
      return;
    }
    throw new Error(`没有名为 ${name} 的事件`);
  }
  on(name: string, fn: () => void) {
    const eventFns = this._eventPool[name];
    // eslint-disable-next-line no-unused-expressions
    eventFns ? eventFns.push(fn) : (this._eventPool[name] = [fn]);
  }
  off(name: string, fn: () => void) {
    const eventFns = this._eventPool[name];
    if (!eventFns) {
      throw new Error(`${name} 中不存在该函数`);
    }
    this._eventPool[name].splice(this._eventPool[name].indexOf(fn), 1);
  }
  once(name: string, fn: () => void) {
    const onceFn = () => {
      fn();
      this.off(name, fn);
    };
    this.on(name, onceFn);
  }
}

/**
 * 全局事件总线
 */
const globalEventBus = new EventBus();
export default globalEventBus;
