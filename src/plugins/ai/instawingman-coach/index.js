import { createOpenAiCompatibleClient } from "../openai-compatible.js";
import { outputSchema } from "./output-schema.js";

const banned = [
  /\bbe (yourself|authentic|genuine)\b/i,
  /\bask about (their|her|his) (interests|hobbies|day)\b/i,
  /\bfind common ground\b/i,
  /\breply warmly\b/i,
  /\bsay hi\b/i,
  /\bsomething like\b/i,
  /\[[^\]]+\]/i,
  /\boverly sexual\b/i
];

function createProvider(options) {
  if ((options.underlyingProvider || "groq") === "groq") {
    return createOpenAiCompatibleClient({
      apiKeyEnv: options.apiKeyEnv || "GROQ_API_KEY",
      baseUrl: options.baseUrl || "https://api.groq.com/openai/v1",
      model: options.model || "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: options.temperature ?? 0.25
    });
  }

  return createOpenAiCompatibleClient({
    apiKeyEnv: options.apiKeyEnv || "OPENAI_API_KEY",
    baseUrl: options.baseUrl || "https://api.openai.com/v1",
    model: options.model || "gpt-4o",
    temperature: options.temperature ?? 0.25
  });
}

function imageParts(processed) {
  return (processed.images || []).map((image) => ({
    type: "image_url",
    image_url: {
      url: `data:${image.contentType || "image/png"};base64,${image.data}`
    }
  }));
}

function buildMessages(processed, profile, failure) {
  return [
    {
      role: "system",
      content: [
        "You are InstaWingman, a real-time Instagram companion for finding friends or romantic interests.",
        "Return only strict JSON matching the schema.",
        "Your advice must be specific to visible Instagram evidence and the user's Type Profile.",
        "The screenshot image is the primary source. OCR may be empty.",
        "quoted_evidence may include visible UI text, usernames, bio words, captions, story text, comments, DM text, or visual details like hiking photo, gym mirror, dog, camera, travel, coffee, concert.",
        "Never be creepy, pushy, sexually forward, manipulative, spammy, or overly familiar.",
        "Messages must be paste-able and sound like a normal person.",
        "Never use brackets or placeholders. Do not write [name], [topic], [specific detail], or similar.",
        "If you do not know a name or topic, use a visible noun from quoted_evidence instead.",
        "Bad: \"Hey [name], cool [topic].\" Good: \"That ramen spot looks elite -- was it worth the wait?\"",
        "Prefer concrete profile/story/comment details over generic compliments.",
        "For profile, story, DM, post, or comment screens: include at least one quoted_evidence item from visible text or visible image details.",
        "If there is a DM box, story reply box, or comment box: include 2-4 paste-able message suggestions.",
        "If there is no message box, suggestions may be empty, but next_action must be concrete and evidence-based.",
        "For explore/search/profile-grid screens: give a discovery action such as follow, skip, react_only, search_next, or open a specific visible profile.",
        "If there is not enough Instagram signal, return not_enough_signal, stay_silent, and no suggestions.",
        "Avoid: be yourself, ask about interests, find common ground, say hi, reply warmly, something like.",
        failure ? `Previous attempt failed: ${failure}` : ""
      ].filter(Boolean).join("\n")
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: [
            "Analyze the current Instagram screenshot.",
            "Use image-visible details even when OCR is empty.",
            "If this is Instagram and any useful text or visual trait is visible, do not return zero evidence.",
            "User Type Profile:",
            JSON.stringify(profile || {}, null, 2),
            "OCR / extracted text:",
            processed.text || "",
            "Return match score, detected traits, next action, and 3-4 copyable message suggestions when possible."
          ].join("\n\n")
        },
        ...imageParts(processed)
      ]
    }
  ];
}

function bannedHit(json) {
  const text = JSON.stringify(json);
  return banned.find((pattern) => pattern.test(text))?.source || null;
}

function deplaceholder(value, evidence) {
  const fallback = evidence[0] || "that post";
  return String(value || "")
    .replace(/\[(name|their name|username)\]/gi, "")
    .replace(/\[(topic|specific detail|detail|interest|hobby)\]/gi, fallback)
    .replace(/\[[^\]]+\]/g, fallback)
    .replace(/\s+/g, " ")
    .replace(/\s+([,?.!])/g, "$1")
    .trim();
}

function repairPlaceholders(json) {
  const evidence = json.screen_context?.quoted_evidence || [];
  const repaired = structuredClone(json);
  repaired.suggestions = (repaired.suggestions || []).map((suggestion) => ({
    ...suggestion,
    message: deplaceholder(suggestion.message, evidence),
    why_it_fits: deplaceholder(suggestion.why_it_fits, evidence)
  }));
  repaired.next_action = {
    ...repaired.next_action,
    reason: deplaceholder(repaired.next_action?.reason, evidence)
  };
  return repaired;
}

function validEnough(json) {
  if (json.next_action?.action === "stay_silent") return true;
  if (!json.screen_context?.quoted_evidence?.length) return false;

  const hasGoodSuggestions = Boolean(json.suggestions?.length) &&
    json.suggestions.every((suggestion) => suggestion.message?.length >= 8 && suggestion.why_it_fits?.length >= 12);
  if (hasGoodSuggestions) return true;

  const actionOnlySurfaces = new Set(["profile", "explore", "search", "post"]);
  const action = json.next_action?.action;
  const actionReason = json.next_action?.reason || "";
  return actionOnlySurfaces.has(json.screen_context?.surface) &&
    action &&
    action !== "stay_silent" &&
    actionReason.length >= 18 &&
    json.match?.label !== "not_enough_signal";
}

function fallback(reason) {
  return {
    text: "Not enough Instagram signal yet.",
    raw: {
      screen_context: { surface: "unknown", quoted_evidence: [], username_or_name: "" },
      match: { score: 0, label: "not_enough_signal", why: reason },
      detected_traits: [],
      suggestions: [],
      next_action: { action: "stay_silent", reason },
      conversation_summary: "",
      safety_note: "Pause on a profile, DM, story, or comment section."
    },
    metadata: { provider: "instawingman-coach", silent: true }
  };
}

export default {
  type: "instawingman-coach",
  kind: "ai",
  create(context, options = {}) {
    const provider = createProvider(options);
    return {
      async complete(processed) {
        if (processed.metadata?.captureUnavailable || !processed.images?.length) {
          return fallback("Screen capture is not available in this context.");
        }

        let failure = null;
        for (let attempt = 0; attempt < (options.maxRegenerations ?? 2) + 1; attempt++) {
          try {
            let json = await provider.completeStructured(
              buildMessages(processed, context.runtime?.profile, failure),
              outputSchema
            );
            json = repairPlaceholders(json);
            const hit = bannedHit(json);
            if (hit) {
              failure = `Banned generic phrase matched ${hit}. Use screenshot evidence and exact wording.`;
              continue;
            }
            if (!validEnough(json)) {
              failure = "Output lacked quoted evidence, copyable message suggestions, or a concrete evidence-based next action.";
              if (options.logFailures) {
                context.logger.warn("instawingman-coach rejected output", {
                  surface: json.screen_context?.surface,
                  evidenceCount: json.screen_context?.quoted_evidence?.length || 0,
                  suggestionsCount: json.suggestions?.length || 0,
                  action: json.next_action?.action,
                  label: json.match?.label,
                  captureSource: processed.metadata?.sourceName,
                  imageCount: processed.images?.length || 0
                });
              }
              continue;
            }

            return {
              text: JSON.stringify(json),
              raw: json,
              metadata: { provider: "instawingman-coach", attempt: attempt + 1 }
            };
          } catch (error) {
            if (String(error.message || error).includes("json_validate_failed")) {
              failure = "JSON did not match schema. Return valid schema JSON only.";
              continue;
            }
            throw error;
          }
        }

        context.logger.warn("instawingman-coach fell back", { failure });
        return fallback(failure || "The model did not produce usable advice.");
      }
    };
  }
};
