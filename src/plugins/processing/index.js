import rawText from "./raw-text.js";
import mockOcr from "./mock-ocr.js";
import visionPassthrough from "./vision-passthrough.js";

export function registerProcessingPlugins(registry) {
  registry.register(rawText);
  registry.register(mockOcr);
  registry.register(visionPassthrough);
}
