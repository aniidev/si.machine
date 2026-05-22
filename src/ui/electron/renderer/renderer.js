const setupView = document.querySelector("#setupView");
const compactView = document.querySelector("#compactView");
const profileSelect = document.querySelector("#profileSelect");
const goalInput = document.querySelector("#goalInput");
const ageInput = document.querySelector("#ageInput");
const genderInput = document.querySelector("#genderInput");
const locationInput = document.querySelector("#locationInput");
const traitsInput = document.querySelector("#traitsInput");
const dealbreakersInput = document.querySelector("#dealbreakersInput");
const toneInput = document.querySelector("#toneInput");
const saveProfileButton = document.querySelector("#saveProfileButton");
const setupCloseButton = document.querySelector("#setupCloseButton");
const statusDot = document.querySelector("#statusDot");
const tipText = document.querySelector("#tipText");
const editButton = document.querySelector("#editButton");
const startButton = document.querySelector("#startButton");

let appConfig = {};
let profileData;
let running = false;
let active = false;
let watchTimer;
let lastSignature;
let lastRunAt = 0;

function setState(text, state = "ready") {
  tipText.textContent = text;
  statusDot.dataset.state = state;
}

function activeProfile() {
  return profileData?.profiles?.find((profile) => profile.id === profileData.activeProfileId) || profileData?.profiles?.[0];
}

function renderProfileSelect() {
  profileSelect.innerHTML = "";
  for (const profile of profileData.profiles) {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = profile.name;
    option.selected = profile.id === profileData.activeProfileId;
    profileSelect.append(option);
  }
  fillProfileForm();
}

function fillProfileForm() {
  const profile = activeProfile();
  if (!profile) return;
  goalInput.value = profile.goal || "";
  ageInput.value = profile.ageRange || "";
  genderInput.value = profile.genderPreference || "";
  locationInput.value = profile.locationPreference || "";
  traitsInput.value = profile.desiredTraits || "";
  dealbreakersInput.value = profile.dealbreakers || "";
  toneInput.value = profile.tone || "";
}

function readProfileForm() {
  const profile = activeProfile();
  if (!profile) return;
  profile.goal = goalInput.value.trim();
  profile.ageRange = ageInput.value.trim();
  profile.genderPreference = genderInput.value.trim();
  profile.locationPreference = locationInput.value.trim();
  profile.desiredTraits = traitsInput.value.trim();
  profile.dealbreakers = dealbreakersInput.value.trim();
  profile.tone = toneInput.value.trim();
}

async function showSetup() {
  stopWatching();
  setupView.hidden = false;
  compactView.hidden = true;
  await window.assistant.setWindowMode("setup");
}

async function showCompact() {
  setupView.hidden = true;
  compactView.hidden = false;
  await window.assistant.setWindowMode("compact");
  setState("Ready when you are.", "ready");
}

async function saveAndContinue() {
  readProfileForm();
  profileData.setupComplete = true;
  await window.assistant.saveProfiles(profileData);
  await showCompact();
}

function firstSuggestion(raw) {
  const suggestion = raw?.suggestions?.[0];
  if (suggestion?.message) {
    const score = Math.round(raw.match?.score || 0);
    return `${score}% - ${suggestion.message}`;
  }
  if (raw?.next_action?.action && raw.next_action.action !== "stay_silent") {
    const score = Math.round(raw.match?.score || 0);
    return `${score}% - ${raw.next_action.action}: ${raw.next_action.reason}`;
  }
  return raw?.next_action?.reason || raw?.safety_note || "Pause on a profile, DM, story, or comment.";
}

async function runPipeline() {
  if (!active || running) return;
  running = true;
  lastRunAt = Date.now();
  startButton.disabled = true;
  setState("Reading Instagram...", "busy");

  try {
    const payload = await window.assistant.runPipeline();
    if (payload.ok === false) {
      setState(payload.error || "Could not read screen.", "error");
      return;
    }

    setState(firstSuggestion(payload.result?.raw || payload.result), "ready");
  } catch (error) {
    setState(error.message || String(error), "error");
  } finally {
    running = false;
    startButton.disabled = false;
  }
}

async function checkForScreenChange() {
  if (!active || running) return;
  const signature = await window.assistant.captureSignature();
  if (signature.ok === false) {
    setState(signature.error || "Screen unavailable.", "error");
    return;
  }

  const current = `${signature.hash}:${signature.size}`;
  if (!lastSignature) {
    lastSignature = current;
    return;
  }

  const cooledDown = Date.now() - lastRunAt >= (appConfig.output?.options?.minAiIntervalMs || 7000);
  if (current !== lastSignature && cooledDown) {
    lastSignature = current;
    runPipeline();
  }
}

function startWatching() {
  active = true;
  startButton.textContent = "Stop";
  setState("Reading Instagram...", "busy");
  if (!watchTimer) {
    watchTimer = setInterval(checkForScreenChange, appConfig.output?.options?.screenPollMs || 1200);
  }
  runPipeline();
}

function stopWatching() {
  active = false;
  startButton.textContent = "Start";
  if (watchTimer) {
    clearInterval(watchTimer);
    watchTimer = undefined;
  }
  if (compactView.hidden === false) {
    setState("Ready when you are.", "ready");
  }
}

profileSelect.addEventListener("change", async () => {
  profileData.activeProfileId = profileSelect.value;
  fillProfileForm();
});
saveProfileButton.addEventListener("click", saveAndContinue);
setupCloseButton.addEventListener("click", () => window.assistant.close());
editButton.addEventListener("click", showSetup);
startButton.addEventListener("click", () => {
  if (active) {
    stopWatching();
    return;
  }
  startWatching();
});

Promise.all([window.assistant.getConfig(), window.assistant.loadProfiles()]).then(async ([config, profiles]) => {
  appConfig = config;
  profileData = profiles;
  renderProfileSelect();

  if (profileData.setupComplete) {
    await showCompact();
  } else {
    await showSetup();
  }
});
