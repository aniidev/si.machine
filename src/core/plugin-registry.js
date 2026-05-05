const validKinds = new Set(["input", "processing", "ai", "output"]);

export class PluginRegistry {
  constructor() {
    this.plugins = new Map();
  }

  register(plugin) {
    if (!validKinds.has(plugin.kind)) {
      throw new Error(`Invalid plugin kind "${plugin.kind}" for plugin "${plugin.type}".`);
    }

    if (!plugin.type || typeof plugin.create !== "function") {
      throw new Error("Plugins must export type, kind, and create(context, options).");
    }

    const key = this.key(plugin.kind, plugin.type);
    this.plugins.set(key, plugin);
  }

  create(kind, type, context, options = {}) {
    const plugin = this.plugins.get(this.key(kind, type));
    if (!plugin) {
      throw new Error(`No ${kind} plugin registered for type "${type}".`);
    }

    return plugin.create(context, options);
  }

  list(kind) {
    return [...this.plugins.values()].filter((plugin) => !kind || plugin.kind === kind);
  }

  key(kind, type) {
    return `${kind}:${type}`;
  }
}
