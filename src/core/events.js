import { EventEmitter } from "node:events";

export function createEventBus() {
  const emitter = new EventEmitter();

  return {
    on: emitter.on.bind(emitter),
    off: emitter.off.bind(emitter),
    emit(event, payload) {
      emitter.emit(event, payload);
    }
  };
}
