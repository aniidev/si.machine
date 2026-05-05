export default {
  type: "local-http",
  kind: "ai",
  create(_context, options = {}) {
    return {
      async complete(processed) {
        if (!options.url) {
          throw new Error('The "local-http" AI plugin requires options.url.');
        }

        const response = await fetch(options.url, {
          method: options.method || "POST",
          headers: {
            "content-type": "application/json",
            ...(options.headers || {})
          },
          body: JSON.stringify({
            text: processed.text,
            images: processed.images,
            metadata: processed.metadata
          })
        });

        if (!response.ok) {
          throw new Error(`Local model request failed (${response.status}): ${await response.text()}`);
        }

        const raw = await response.json();
        return {
          text: raw.text || raw.response || JSON.stringify(raw, null, 2),
          raw,
          metadata: {
            provider: "local-http"
          }
        };
      }
    };
  }
};
