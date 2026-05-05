export default {
  type: "raw-text",
  kind: "processing",
  create() {
    return {
      async process(input) {
        if (input.contentType !== "text/plain") {
          throw new Error(`raw-text processing expected text/plain but received ${input.contentType}.`);
        }

        return {
          text: input.data,
          images: [],
          metadata: {
            ...input.metadata,
            sourceType: input.sourceType
          }
        };
      }
    };
  }
};
