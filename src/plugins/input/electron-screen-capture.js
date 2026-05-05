export default {
  type: "electron-screen-capture",
  kind: "input",
  create(context, options = {}) {
    return {
      async capture() {
        const desktopCapturer = context.electron?.desktopCapturer;
        if (!desktopCapturer) {
          throw new Error("electron-screen-capture requires Electron desktopCapturer in context.");
        }

        const sources = await desktopCapturer.getSources({
          types: options.types || ["screen"],
          thumbnailSize: options.thumbnailSize || { width: 1440, height: 900 }
        });

        const source = options.sourceName
          ? sources.find((item) => item.name === options.sourceName)
          : sources[0];

        if (!source) {
          throw new Error("No screen capture source was available.");
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
