export default {
  type: "vision-passthrough",
  kind: "processing",
  create() {
    return {
      async process(input) {
        return {
          text: input.contentType === "text/plain" ? input.data : "",
          images: input.contentType.startsWith("image/") ? [input] : [],
          metadata: input.metadata
        };
      }
    };
  }
};
