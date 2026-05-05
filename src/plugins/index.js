import { registerInputPlugins } from "./input/index.js";
import { registerProcessingPlugins } from "./processing/index.js";
import { registerAiPlugins } from "./ai/index.js";
import { registerOutputPlugins } from "./output/index.js";

export function registerBuiltInPlugins(registry) {
  registerInputPlugins(registry);
  registerProcessingPlugins(registry);
  registerAiPlugins(registry);
  registerOutputPlugins(registry);
}
