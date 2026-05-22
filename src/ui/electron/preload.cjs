const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("assistant", {
  getConfig() {
    return ipcRenderer.invoke("app:get-config");
  },
  runPipeline(options) {
    return ipcRenderer.invoke("pipeline:run", options || {});
  },
  onResult(callback) {
    ipcRenderer.on("pipeline:result", (_event, payload) => callback(payload));
  },
  captureSignature() {
    return ipcRenderer.invoke("screen:capture-signature");
  },
  minimize() {
    return ipcRenderer.invoke("window:minimize");
  },
  close() {
    return ipcRenderer.invoke("window:close");
  },
  setWindowMode(mode) {
    return ipcRenderer.invoke("window:set-mode", mode);
  },
  loadProfiles() {
    return ipcRenderer.invoke("profiles:load");
  },
  saveProfiles(data) {
    return ipcRenderer.invoke("profiles:save", data);
  }
});
