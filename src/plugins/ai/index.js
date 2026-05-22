import echo from "./echo.js";
import openaiCompatible from "./openai-compatible.js";
import localHttp from "./local-http.js";
import instagramCoach from "./instagram-coach/index.js";
import instaWingmanCoach from "./instawingman-coach/index.js";

export function registerAiPlugins(registry) {
  registry.register(echo);
  registry.register(openaiCompatible);
  registry.register(localHttp);
  registry.register(instagramCoach);
  registry.register(instaWingmanCoach);
}
