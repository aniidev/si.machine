const CHANNEL_EMOJI = {
  story_reply: "\u{1F4D6}",
  dm_new: "\u{2709}\u{FE0F}",
  dm_existing: "\u{1F4AC}",
  comment: "\u{1F4AD}",
  react_only: "\u{2764}\u{FE0F}",
  stay_silent: "\u{1F440}"
};

export function formatForOverlay(json, rubric) {
  if (json?.silent) {
    return "\u{1F440} watching - not enough signal to advise yet";
  }

  const probability = Math.round((json.predicted_response.probability || 0) * 100);
  return [
    `\u{1F4CD} ${CHANNEL_EMOJI[json.channel] || json.channel} ${json.situation_read.inferred_emotion}`,
    `stakes: ${json.situation_read.social_stakes}`,
    "",
    "\u{1F4AC} SEND THIS:",
    json.exact_message_to_send,
    "",
    "\u{1F3AF} WHY THIS WORKS HERE:",
    json.why_not_generic_advice,
    "",
    `\u{1F52E} LIKELY REPLY (${probability}%):`,
    `"${json.predicted_response.likely_reply_text}"`,
    `-> then: ${json.predicted_response.next_move}`,
    "",
    "\u{23F0} IF NO REPLY IN 48H:",
    json.if_no_reply_in_48h,
    "",
    `rubric: ${rubric?.passCount ?? "n/a"}/7`
  ].join("\n");
}
