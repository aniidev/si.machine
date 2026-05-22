import { readFile } from "node:fs/promises";
import path from "node:path";
import instagramCoach from "../src/plugins/ai/instagram-coach/index.js";
import { checkBannedPhrases } from "../src/plugins/ai/instagram-coach/banned-phrases.js";
import { scoreRubric } from "../src/plugins/ai/instagram-coach/rubric.js";
import { createLogger } from "../src/core/logger.js";
import { loadDotEnv } from "../src/core/env-loader.js";

const fixtures = [
  ["dm-cold.svg", "Instagram DM Maya ceramics studio first glaze firing survived reply box"],
  ["dm-existing.svg", "Instagram DM Jordan espresso setup finally dialed in grinder message box active"],
  ["profile-view.svg", "Instagram profile Priya climbing matcha community gardens mutuals Alex Noor suggested for you"],
  ["story-viewer.svg", "Instagram story Leo first 10k done knees survived reply box"],
  ["comment-section.svg", "Instagram comment section Nina weekend in Queens Night Market add a comment"],
  ["non-instagram.svg", "Spreadsheet quarterly budget revenue expenses forecast"]
];

await loadDotEnv(process.cwd());

if (!process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY) {
  console.log("Set OPENAI_API_KEY or GROQ_API_KEY to run live fixture tests.");
  process.exit(0);
}

const useGroq = !process.env.OPENAI_API_KEY && process.env.GROQ_API_KEY;
const coach = instagramCoach.create({
  logger: createLogger("test-coach")
}, {
  underlyingProvider: useGroq ? "groq" : "openai",
  apiKeyEnv: useGroq ? "GROQ_API_KEY" : "OPENAI_API_KEY",
  model: useGroq ? "meta-llama/llama-4-scout-17b-16e-instruct" : "gpt-4o",
  maxRegenerations: 2,
  minRubricPass: 6,
  logFailures: true
});

const rows = [];
for (const [fileName, ocrText] of fixtures) {
  const filePath = path.resolve("examples/screenshots", fileName);
  const data = await readFile(filePath);
  const processed = {
    text: ocrText,
    images: [{
      contentType: "image/svg+xml",
      data: data.toString("base64"),
      metadata: { filePath }
    }],
    metadata: { filePath, fixture: true }
  };

  try {
    const result = await coach.complete(processed);
    const rubric = result.raw ? scoreRubric(result.raw, processed) : { passCount: 0, failures: ["silent"] };
    const banHit = checkBannedPhrases(JSON.stringify(result.raw || result));
    rows.push({
      fixture: fileName,
      channel: result.raw?.channel || "silent",
      confidence: result.raw?.confidence ?? "n/a",
      rubric: `${rubric.passCount}/7`,
      banned: banHit || "",
      failures: rubric.failures.join(",")
    });
  } catch (error) {
    rows.push({
      fixture: fileName,
      channel: "error",
      confidence: "n/a",
      rubric: "0/7",
      banned: "",
      failures: error.message
    });
  }
}

console.table(rows);
