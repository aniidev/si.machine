export default {
  type: "screen-placeholder",
  kind: "input",
  create(_context, options = {}) {
    return {
      async capture() {
        return {
          sourceType: "screen",
          contentType: "text/plain",
          data: options.text || "Screen capture placeholder. Replace with an Electron desktopCapturer input plugin for real capture.",
          metadata: {
            simulated: true
          }
        };
      }
    };
  }
};
