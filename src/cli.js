import { runConfig } from "./run-config.js";

function readArg(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const configPath = readArg("--config", "configs/sample.cli.json");

runConfig(configPath).catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
