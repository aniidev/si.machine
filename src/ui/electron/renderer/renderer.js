const tip = document.querySelector("#tip");
const statusDot = document.querySelector("#statusDot");
const overlay = document.querySelector(".overlay");
let appConfig = {};
let watchTimer;
let running = false;
let lastSignature;
let lastRunAt = 0;

if (!window.assistant) {
  setTip("Startup error.");
  throw new Error("Missing window.assistant preload API.");
}

function setState(state = "ready") {
  statusDot.dataset.state = state;
}

function shortestTip(text) {
  const lines = String(text || "")
    .replace(/^tips?:/i, "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter(Boolean);

  const first = lines[0] || String(text || "").trim();
  return first.replace(/\s+/g, " ").slice(0, 120) || "No friend-making tip yet.";
}

function setTip(text) {
  tip.textContent = shortestTip(text);
}

async function runPipeline() {
  if (running) {
    return;
  }

  running = true;
  lastRunAt = Date.now();
  setState("busy");

  try {
    const payload = await window.assistant.runPipeline();
    if (payload.ok === false) {
      setState("error");
      setTip(payload.error || "Could not read Instagram.");
      return;
    }

    setTip(payload.result?.text || payload.text || "");
    setState("ready");
  } catch (error) {
    setState("error");
    setTip(error.message || String(error));
  } finally {
    running = false;
  }
}

async function checkForScreenChange() {
  if (running) {
    return;
  }

  const signature = await window.assistant.captureSignature();
  if (signature.ok === false) {
    setState("error");
    setTip(signature.error || "Could not watch screen.");
    return;
  }

  const current = `${signature.hash}:${signature.size}`;
  if (!lastSignature) {
    lastSignature = current;
    return;
  }

  const minIntervalMs = appConfig.output?.options?.minAiIntervalMs || 6000;
  const changed = current !== lastSignature;
  const cooledDown = Date.now() - lastRunAt >= minIntervalMs;

  if (changed && cooledDown) {
    lastSignature = current;
    runPipeline();
  }
}

function startWatching() {
  const pollMs = appConfig.output?.options?.screenPollMs || 1200;
  if (!watchTimer) {
    watchTimer = setInterval(checkForScreenChange, pollMs);
  }
}

overlay.addEventListener("dblclick", runPipeline);

window.assistant.getConfig().then((config) => {
  appConfig = config;

  if (config.output?.options?.autoRun !== false) {
    runPipeline();
  }

  if (config.output?.options?.watchOnLaunch !== false) {
    startWatching();
  }
});
