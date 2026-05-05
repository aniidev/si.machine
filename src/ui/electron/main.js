import { app, BrowserWindow, desktopCapturer, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "../../core/config-loader.js";
import { runConfig } from "../../run-config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.setPath("userData", path.resolve(process.cwd(), ".electron-user-data"));

function readConfigArg() {
  const index = process.argv.indexOf("--config");
  return index >= 0 ? process.argv[index + 1] : "configs/sample.text-panel.json";
}

async function createWindow() {
  const configPath = readConfigArg();
  const loadedConfig = await loadConfig(configPath, process.cwd());
  const window = new BrowserWindow({
    width: loadedConfig.config.output.options?.width || 460,
    height: loadedConfig.config.output.options?.height || 620,
    minWidth: loadedConfig.config.output.options?.minWidth || 300,
    minHeight: loadedConfig.config.output.options?.minHeight || 220,
    alwaysOnTop: loadedConfig.config.output.options?.alwaysOnTop ?? true,
    frame: loadedConfig.config.output.options?.frame ?? true,
    transparent: loadedConfig.config.output.options?.transparent ?? false,
    resizable: loadedConfig.config.output.options?.resizable ?? true,
    title: loadedConfig.config.app?.name || "AI Assistant Overlay",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs")
    }
  });

  ipcMain.removeHandler("app:get-config");
  ipcMain.handle("app:get-config", async () => ({
    app: loadedConfig.config.app || {},
    input: loadedConfig.config.input || {},
    processing: loadedConfig.config.processing || {},
    ai: loadedConfig.config.ai || {},
    output: loadedConfig.config.output || {}
  }));

  ipcMain.removeHandler("window:minimize");
  ipcMain.handle("window:minimize", async () => {
    window.minimize();
  });

  ipcMain.removeHandler("window:close");
  ipcMain.handle("window:close", async () => {
    window.close();
  });

  ipcMain.removeHandler("pipeline:run");
  ipcMain.handle("pipeline:run", async (_event, options = {}) => {
    try {
      const output = await runConfig(configPath, {
        runtime: {
          prompt: options.prompt
        },
        electron: {
          desktopCapturer,
          sendResult(payload) {
            window.webContents.send("pipeline:result", payload);
          }
        }
      });

      return {
        ok: true,
        result: output.result,
        captured: output.captured,
        processed: output.processed,
        app: loadedConfig.config.app || {}
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || String(error)
      };
    }
  });

  ipcMain.removeHandler("screen:capture-signature");
  ipcMain.handle("screen:capture-signature", async () => {
    try {
      const sources = await desktopCapturer.getSources({
        types: loadedConfig.config.input.options?.types || ["screen"],
        thumbnailSize: { width: 320, height: 200 }
      });
      const source = sources[0];
      if (!source) {
        return { ok: false, error: "No screen source available." };
      }

      const buffer = source.thumbnail.resize({ width: 64, height: 40 }).toPNG();
      let hash = 2166136261;
      for (let index = 0; index < buffer.length; index += 97) {
        hash ^= buffer[index];
        hash = Math.imul(hash, 16777619);
      }

      return {
        ok: true,
        hash: String(hash >>> 0),
        size: buffer.length
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || String(error)
      };
    }
  });

  await window.loadFile(path.join(__dirname, "renderer", "index.html"));
}

process.on("uncaughtException", (error) => {
  if (error.code === "EPIPE") {
    return;
  }

  try {
    console.error(error);
  } catch {
    app.quit();
  }
});

process.on("unhandledRejection", (reason) => {
  const message = reason?.message || String(reason);
  if (reason?.code === "EPIPE" || message.includes("EPIPE")) {
    return;
  }

  try {
    console.error(reason);
  } catch {
    app.quit();
  }
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
