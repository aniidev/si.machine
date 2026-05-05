import { readFile } from "node:fs/promises";
import path from "node:path";

export async function loadDotEnv(rootDir = process.cwd(), fileName = ".env") {
  const envPath = path.resolve(rootDir, fileName);

  let raw;
  try {
    raw = await readFile(envPath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }

  return true;
}
