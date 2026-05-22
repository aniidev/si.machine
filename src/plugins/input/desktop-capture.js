export default {
  type: "desktop-capture",
  kind: "input",
  create(context, options = {}) {
    return {
      async capture() {
        const desktopCapturer = context.electron?.desktopCapturer;
        if (!desktopCapturer) {
          return {
            sourceType: "screen",
            contentType: "text/plain",
            data: "Desktop capture is only available inside Electron. Use image-file input for CLI fixtures.",
            metadata: {
              captureUnavailable: true,
              requestedOptions: options
            }
          };
        }

        const sources = await desktopCapturer.getSources({
          types: options.types || ["screen"],
          thumbnailSize: options.thumbnailSize || { width: 1440, height: 900 }
        });
        const source = sources[0];
        if (!source) {
          throw new Error("No desktop capture source was available.");
        }

        return {
          sourceType: "screen",
          contentType: "image/png",
          data: source.thumbnail.toPNG().toString("base64"),
          metadata: {
            sourceId: source.id,
            sourceName: source.name,
            encoding: "base64",
            capturedAt: new Date().toISOString()
          }
        };
      }
    };
  }
};
