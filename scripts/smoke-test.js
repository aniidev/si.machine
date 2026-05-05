import { runConfig } from "../src/run-config.js";

const output = await runConfig("configs/sample.cli.json");

if (!output.result.text.includes("AI provider placeholder:")) {
  throw new Error("Smoke test failed: expected echo AI output.");
}

console.log("Smoke test passed.");
