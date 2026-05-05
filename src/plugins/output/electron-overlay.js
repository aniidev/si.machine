export default {
  type: "electron-overlay",
  kind: "output",
  create(context) {
    return {
      async render(result, details) {
        if (!context.electron?.sendResult) {
          context.logger.warn("Electron output selected outside Electron; printing result instead.");
          console.log(result.text);
          return;
        }

        context.electron.sendResult({
          result,
          captured: details.captured,
          processed: details.processed,
          app: details.config.app || {}
        });
      }
    };
  }
};
