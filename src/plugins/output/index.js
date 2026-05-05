import cli from "./cli.js";
import webPanel from "./web-panel.js";
import electronOverlay from "./electron-overlay.js";

export function registerOutputPlugins(registry) {
  registry.register(cli);
  registry.register(webPanel);
  registry.register(electronOverlay);
}
