export function buildMessages(options, processed) {
  const messages = [];

  if (options.systemPrompt) {
    messages.push({
      role: "system",
      content: options.systemPrompt
    });
  }

  const textContent = processed.text || "Analyze the provided input.";
  if (!processed.images?.length) {
    messages.push({
      role: "user",
      content: textContent
    });
    return messages;
  }

  messages.push({
    role: "user",
    content: [
      { type: "text", text: textContent },
      ...processed.images.map((image) => ({
        type: "image_url",
        image_url: {
          url: `data:${image.contentType};base64,${image.data}`
        }
      }))
    ]
  });

  return messages;
}

export function createOpenAiCompatibleClient(options = {}) {
  return {
    async complete(processed) {
      const messages = buildMessages(options, processed);
      const raw = await this.completeMessages(messages);

      return {
        text: raw.choices?.[0]?.message?.content || "",
        raw,
        metadata: {
          provider: "openai-compatible",
          model: options.model || "gpt-4.1-mini"
        }
      };
    },

    async completeMessages(messages, extraBody = {}) {
      const apiKey = process.env[options.apiKeyEnv || "OPENAI_API_KEY"];
      if (!apiKey) {
        throw new Error(`Missing API key environment variable: ${options.apiKeyEnv || "OPENAI_API_KEY"}.`);
      }

      const baseUrl = options.baseUrl || "https://api.openai.com/v1";
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: options.model || "gpt-4.1-mini",
          messages,
          temperature: options.temperature ?? 0.2,
          ...extraBody
        })
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`AI provider request failed (${response.status}): ${body}`);
      }

      return response.json();
    },

    async completeStructured(messages, schema, structuredOptions = {}) {
      // Default to json_object mode: it's supported on every Groq/OpenAI model,
      // doesn't require the schema to fit OpenAI strict-mode keyword rules
      // (no maxLength / minimum / minItems support there), and our local rubric
      // already validates the shape. Opt into json_schema explicitly when the
      // model + schema are known to be compatible.
      const mode = structuredOptions.mode || "json_object";
      const responseFormat = mode === "json_schema"
        ? {
            type: "json_schema",
            json_schema: {
              name: structuredOptions.schemaName || "structured_output",
              strict: structuredOptions.strict ?? true,
              schema
            }
          }
        : { type: "json_object" };

      const raw = await this.completeMessages(messages, {
        response_format: responseFormat
      });
      const content = raw.choices?.[0]?.message?.content || "{}";
      try {
        return JSON.parse(content);
      } catch (error) {
        throw new Error(`AI provider returned non-JSON content: ${content.slice(0, 200)}`);
      }
    }
  };
}

export default {
  type: "openai-compatible",
  kind: "ai",
  create(_context, options = {}) {
    return createOpenAiCompatibleClient(options);
  }
};
