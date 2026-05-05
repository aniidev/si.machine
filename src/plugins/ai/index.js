import echo from "./echo.js";
import openaiCompatible from "./openai-compatible.js";
import localHttp from "./local-http.js";

export function registerAiPlugins(registry) {
  registry.register(echo);
  registry.register(openaiCompatible);
  registry.register(localHttp);
}
