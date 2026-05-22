import { createOpenAiCompatibleClient } from "../openai-compatible.js";
import { buildSystemPrompt } from "./system-prompt.js";
import { fewShotExamples } from "./few-shot-examples.js";
import { outputSchema } from "./output-schema.js";
import { checkBannedPhrases } from "./banned-phrases.js";
import { scoreRubric } from "./rubric.js";
import { formatForOverlay } from "./formatter.js";

function createProvider(options) {
  const provider = options.underlyingProvider || "openai";
  if (provider === "openai") {
    return createOpenAiCompatibleClient({
      apiKeyEnv: options.apiKeyEnv || "OPENAI_API_KEY",
      baseUrl: options.baseUrl || "https://api.openai.com/v1",
      model: options.model || "gpt-4o",
      temperature: options.temperature ?? 0.2
    });
  }

  if (provider === "groq") {
    return createOpenAiCompatibleClient({
      apiKeyEnv: options.apiKeyEnv || "GROQ_API_KEY",
      baseUrl: options.baseUrl || "https://api.groq.com/openai/v1",
      model: options.model || "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: options.temperature ?? 0.2
    });
  }

  if (provider === "openai-compatible") {
    return createOpenAiCompatibleClient(options);
  }

  throw new Error(`Unsupported instagram-coach underlyingProvider "${provider}".`);
}

function imageParts(processed) {
  const images = processed.images || (processed.image ? [processed.image] : []);
  return images.map((image) => ({
    type: "image_url",
    image_url: {
      url: image.data?.startsWith("data:")
        ? image.data
        : `data:${image.contentType || "image/png"};base64,${image.data}`
    }
  }));
}

function buildMessages({ systemPrompt, userPayload, previousFailureReason }) {
  const parts = [
    {
      type: "text",
      text: [
        "Analyze this Instagram screen.",
        "The screenshot image is the primary source. OCR may be empty or incomplete.",
        "If Instagram UI, a profile, DM, story, post, comment box, handle, caption, or visible interest appears, extract evidence from the image and do not stay silent.",
        `OCR text:\n${userPayload.text || userPayload.ocrText || ""}`,
        `Screen metadata:\n${JSON.stringify(userPayload.metadata || userPayload.screenContext || {})}`,
        previousFailureReason ? `Previous failure reason:\n${previousFailureReason}` : ""
      ].filter(Boolean).join("\n\n")
    },
    ...imageParts(userPayload)
  ];

  return [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `Few-shot examples are embedded in the system prompt. Count: ${fewShotExamples.length}.`
        }
      ]
    },
    { role: "user", content: parts }
  ];
}

function silentResult(reason) {
  const text = reason?.includes("stay_silent") || reason?.includes("chose stay_silent")
    ? "Pause on an Instagram DM, story, profile, or comment."
    : formatForOverlay({ silent: true });

  return {
    text,
    silent: true,
    reason,
    metadata: {
      provider: "instagram-coach",
      silent: true
    }
  };
}

export default {
  type: "instagram-coach",
  kind: "ai",
  create(context, options = {}) {
    const provider = createProvider(options);
    const maxRegenerations = options.maxRegenerations ?? 2;
    const minRubricPass = options.minRubricPass ?? 6;

    return {
      provider,

      async complete(processed) {
        if (processed.metadata?.captureUnavailable || (!processed.images?.length && !processed.image && !processed.text)) {
          return silentResult("No usable Instagram screenshot was available.");
        }

        let attempts = 0;
        let lastError = null;

        while (attempts < maxRegenerations + 1) {
          attempts++;
          const messages = buildMessages({
            systemPrompt: buildSystemPrompt(lastError),
            fewShotExamples,
            userPayload: processed,
            previousFailureReason: lastError
          });

          let json;
          try {
            json = await this.provider.completeStructured(messages, outputSchema, {
              schemaName: "instagram_coach_output"
            });
          } catch (error) {
            const message = String(error.message || error);
            const recoverable = message.includes("json_validate_failed") ||
              message.includes("non-JSON content");
            if (recoverable) {
              lastError = "Your previous response was not valid JSON matching the required shape. Re-read the screenshot, extract concrete Instagram evidence, and emit a single JSON object with all required keys.";
              if (options.logFailures) context.logger.warn("instagram-coach json parse failed", { attempts, error: message.slice(0, 400) });
              continue;
            }
            throw error;
          }

          if (json.channel === "stay_silent" && Number(json.confidence) < 0.5) {
            lastError = "You chose stay_silent. Retry by inspecting the screenshot image itself for Instagram handles, captions, story text, profile bio nouns, comment text, or DM text. Stay silent only if it is truly blank or not Instagram.";
            if (options.logFailures) context.logger.warn("instagram-coach stayed silent", { attempts });
            continue;
          }

          const banHit = checkBannedPhrases(JSON.stringify(json));
          if (banHit) {
            lastError = `Used banned phrase "${banHit}". Reroute through specific evidence from the screenshot.`;
            if (options.logFailures) context.logger.warn("instagram-coach banned phrase", { banHit, attempts });
            continue;
          }

          const rubric = scoreRubric(json, processed);
          if (rubric.passCount < minRubricPass) {
            lastError = `Rubric failed on: ${rubric.failures.join(", ")}. Fix these specifically.`;
            if (options.logFailures) context.logger.warn("instagram-coach rubric failed", { failures: rubric.failures, attempts });
            continue;
          }

          return {
            text: formatForOverlay(json, rubric),
            raw: json,
            metadata: {
              provider: "instagram-coach",
              attempts,
              rubric
            }
          };
        }

        return silentResult(lastError);
      }
    };
  }
};
