import { loadConfig } from "./core/config-loader.js";
import { loadDotEnv } from "./core/env-loader.js";
import { PluginRegistry } from "./core/plugin-registry.js";
import { runPipeline } from "./core/pipeline.js";
import { registerBuiltInPlugins } from "./plugins/index.js";
import { createAppContext } from "./create-app-context.js";

export async function runConfig(configPath, options = {}) {
  await loadDotEnv(options.rootDir || process.cwd());
  const loaded = await loadConfig(configPath, options.rootDir || process.cwd());
  const registry = new PluginRegistry();
  registerBuiltInPlugins(registry);

  if (options.registerPlugins) {
    await options.registerPlugins(registry);
  }

  const context = createAppContext({
    ...loaded,
    electron: options.electron,
    runtime: options.runtime
  });

  return runPipeline(registry, context);
}
