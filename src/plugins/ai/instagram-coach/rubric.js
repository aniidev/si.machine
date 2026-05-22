const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "from",
  "has", "have", "he", "her", "his", "i", "in", "is", "it", "its", "me",
  "my", "of", "on", "or", "our", "she", "that", "the", "their", "them",
  "they", "this", "to", "was", "we", "were", "what", "when", "where",
  "who", "with", "you", "your"
]);

function tokenizeContent(value) {
  return String(value || "")
    .toLowerCase()
    .match(/[a-z0-9][a-z0-9'-]{2,}/g)?.filter((word) => !STOPWORDS.has(word)) || [];
}

function hasTimeframe(value) {
  return /\b(hours?|days?|tonight|tomorrow|this week|now)\b/i.test(String(value || ""));
}

export function scoreRubric(json, processed = {}) {
  const failures = [];
  const details = {};
  if (json?.channel === "stay_silent" && Number(json?.confidence) < 0.5) {
    return {
      passCount: 7,
      failures,
      details: {
        stay_silent: true
      }
    };
  }

  const evidence = json?.situation_read?.quoted_evidence || [];
  const message = json?.exact_message_to_send || "";
  const evidenceWords = new Set(tokenizeContent(evidence.join(" ")));
  const messageWords = new Set(tokenizeContent(message));
  const shared = [...messageWords].filter((word) => evidenceWords.has(word));
  const detailWords = tokenizeContent(json?.specific_detail_referenced || "");
  const detailInEvidence = detailWords.some((word) => evidenceWords.has(word));

  details.concrete_noun = { shared, detailInEvidence };
  if (shared.length < 1 || !detailInEvidence) failures.push("concrete_noun");

  details.paste_able = message.length >= 10 &&
    !/\[[^\]]+\]/.test(message) &&
    !/\bsomething like\b/i.test(message);
  if (!details.paste_able) failures.push("paste_able");

  const probability = json?.predicted_response?.probability;
  details.prediction = String(json?.predicted_response?.likely_reply_text || "").length >= 5 &&
    typeof probability === "number" &&
    probability >= 0.1 &&
    probability <= 0.95;
  if (!details.prediction) failures.push("prediction");

  details.time_bound = Boolean(String(json?.if_no_reply_in_48h || "").trim()) || hasTimeframe(message);
  if (!details.time_bound) failures.push("time_bound");

  const antiGeneric = json?.why_not_generic_advice || "";
  details.anti_counterfactual = antiGeneric.length >= 40 && /\b(don't|avoid|not)\b/i.test(antiGeneric);
  if (!details.anti_counterfactual) failures.push("anti_counterfactual");

  details.history_aware = !processed.priorContext || JSON.stringify(json).toLowerCase().includes(String(processed.priorContext).toLowerCase().slice(0, 24));
  if (!details.history_aware) failures.push("history_aware");

  details.channel_specific = json?.channel !== "stay_silent" || Number(json?.confidence) < 0.5;
  if (!details.channel_specific) failures.push("channel_specific");

  return {
    passCount: 7 - failures.length,
    failures,
    details
  };
}
