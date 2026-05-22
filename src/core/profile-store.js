import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const defaultProfiles = {
  setupComplete: false,
  activeProfileId: "girlfriend-mode",
  profiles: [
    {
      id: "girlfriend-mode",
      name: "Girlfriend Mode",
      goal: "dating",
      ageRange: "22-28",
      genderPreference: "women",
      locationPreference: "within 50 miles",
      desiredTraits: "outdoor adventurous, loves hiking, sarcastic humor, fitness-oriented, emotionally warm",
      dealbreakers: "heavy partying, rude comments, no shared interests, pushy energy",
      tone: "playful, chill, specific, confident but not pushy"
    },
    {
      id: "gym-friends",
      name: "Gym Friends",
      goal: "friends",
      ageRange: "20-35",
      genderPreference: "any",
      locationPreference: "nearby",
      desiredTraits: "fitness-oriented, consistent, positive, likes lifting or running",
      dealbreakers: "ego-lifting, negativity, spammy influencer behavior",
      tone: "direct, friendly, low-pressure"
    },
    {
      id: "photography-friends",
      name: "Photography Friends",
      goal: "friends",
      ageRange: "20-35",
      genderPreference: "any",
      locationPreference: "same city",
      desiredTraits: "street photography, creative, curious, likes photowalks",
      dealbreakers: "clout chasing, no visible creative interest",
      tone: "curious, thoughtful, low-key"
    }
  ]
};

function normalizeProfiles(data) {
  return {
    ...structuredClone(defaultProfiles),
    ...data,
    setupComplete: Boolean(data.setupComplete),
    profiles: data.profiles?.length ? data.profiles : structuredClone(defaultProfiles.profiles)
  };
}

function storePath(rootDir = process.cwd()) {
  return path.resolve(rootDir, "data", "profiles.json");
}

export async function loadProfiles(rootDir = process.cwd()) {
  const filePath = storePath(rootDir);
  try {
    return normalizeProfiles(JSON.parse(await readFile(filePath, "utf8")));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await saveProfiles(defaultProfiles, rootDir);
    return structuredClone(defaultProfiles);
  }
}

export async function saveProfiles(data, rootDir = process.cwd()) {
  const filePath = storePath(rootDir);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  return data;
}

export async function getActiveProfile(rootDir = process.cwd()) {
  const data = await loadProfiles(rootDir);
  return data.profiles.find((profile) => profile.id === data.activeProfileId) || data.profiles[0] || null;
}
