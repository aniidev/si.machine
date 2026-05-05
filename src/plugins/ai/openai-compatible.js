function buildMessages(options, processed) {
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

export default {
  type: "openai-compatible",
  kind: "ai",
  create(_context, options = {}) {
    return {
      async complete(processed) {
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
            messages: buildMessages(options, processed),
            temperature: options.temperature ?? 0.2
          })
        });

        if (!response.ok) {
          const body = await response.text();
          throw new Error(`AI provider request failed (${response.status}): ${body}`);
        }

        const raw = await response.json();
        return {
          text: raw.choices?.[0]?.message?.content || "",
          raw,
          metadata: {
            provider: "openai-compatible",
            model: options.model || "gpt-4.1-mini"
          }
        };
      }
    };
  }
};
