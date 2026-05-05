export default {
  type: "electron-desktop-capture",
  kind: "input",
  create(context, options = {}) {
    return {
      async capture() {
        const desktopCapturer = context.electron?.desktopCapturer;
        if (!desktopCapturer) {
          throw new Error("electron-desktop-capture requires Electron desktopCapturer in context.");
        }

        const sources = await desktopCapturer.getSources({
          types: options.types || ["screen", "window"],
          thumbnailSize: options.thumbnailSize || { width: 1280, height: 720 }
        });
        const source = sources.find((item) => item.name === options.sourceName) || sources[0];
        if (!source) {
          throw new Error("No desktop capture sources were available.");
        }

        return {
          sourceType: "screen",
          contentType: "image/png",
          data: source.thumbnail.toPNG().toString("base64"),
          metadata: {
            sourceId: source.id,
            sourceName: source.name,
            encoding: "base64"
          }
        };
      }
    };
  }
};
