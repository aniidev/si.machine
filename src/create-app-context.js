import { createEventBus } from "./core/events.js";
import { createLogger } from "./core/logger.js";

export function createAppContext({ config, configPath, rootDir, electron, runtime } = {}) {
  const events = createEventBus();

  return {
    config,
    configPath,
    rootDir,
    events,
    logger: createLogger(config?.app?.name || "assistant-template"),
    electron,
    runtime: runtime || {}
  };
}
