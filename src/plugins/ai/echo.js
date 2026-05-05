export default {
  type: "echo",
  kind: "ai",
  create(_context, options = {}) {
    return {
      async complete(processed) {
        const prefix = options.prefix || "Echo AI:";
        const imageSummary = processed.images?.length
          ? `Captured ${processed.images.length} image(s). A vision/OCR AI provider can read text and reason over this screenshot.`
          : "";
        const text = [processed.text, imageSummary].filter(Boolean).join("\n\n");

        return {
          text: `${prefix}\n\n${text}`.trim(),
          raw: {
            deterministic: true
          },
          metadata: {
            provider: "echo"
          }
        };
      }
    };
  }
};
