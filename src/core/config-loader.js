import { readFile } from "node:fs/promises";
import path from "node:path";

const requiredSections = ["input", "processing", "ai", "output"];

export async function loadConfig(configPath, cwd = process.cwd()) {
  const resolvedPath = path.resolve(cwd, configPath);
  const raw = await readFile(resolvedPath, "utf8");
  const config = JSON.parse(raw);

  for (const section of requiredSections) {
    if (!config[section]?.type) {
      throw new Error(`Config section "${section}" must define a plugin type.`);
    }
  }

  return {
    config,
    configPath: resolvedPath,
    rootDir: cwd
  };
}
