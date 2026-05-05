export default {
  type: "mock-ocr",
  kind: "processing",
  create(_context, options = {}) {
    return {
      async process(input) {
        return {
          text: options.text || `[mock OCR output for ${input.sourceType}]`,
          images: input.sourceType === "image" || input.sourceType === "screen" ? [input] : [],
          metadata: {
            ...input.metadata,
            ocr: "mock"
          }
        };
      }
    };
  }
};
