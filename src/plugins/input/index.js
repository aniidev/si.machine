import textFile from "./text-file.js";
import imageFile from "./image-file.js";
import screenPlaceholder from "./screen-placeholder.js";
import electronScreenCapture from "./electron-screen-capture.js";
import desktopCapture from "./desktop-capture.js";

export function registerInputPlugins(registry) {
  registry.register(textFile);
  registry.register(imageFile);
  registry.register(screenPlaceholder);
  registry.register(electronScreenCapture);
  registry.register(desktopCapture);
}
