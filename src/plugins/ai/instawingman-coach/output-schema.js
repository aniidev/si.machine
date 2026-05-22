export const outputSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "screen_context",
    "match",
    "detected_traits",
    "suggestions",
    "next_action",
    "conversation_summary",
    "safety_note"
  ],
  properties: {
    screen_context: {
      type: "object",
      additionalProperties: false,
      required: ["surface", "quoted_evidence", "username_or_name"],
      properties: {
        surface: { enum: ["profile", "dm_thread", "story", "post", "comment_section", "explore", "search", "unknown"] },
        quoted_evidence: {
          type: "array",
          minItems: 0,
          maxItems: 5,
          items: { type: "string", maxLength: 120 }
        },
        username_or_name: { type: "string", maxLength: 80 }
      }
    },
    match: {
      type: "object",
      additionalProperties: false,
      required: ["score", "label", "why"],
      properties: {
        score: { type: "number", minimum: 0, maximum: 100 },
        label: { enum: ["strong_match", "maybe", "weak_match", "not_enough_signal"] },
        why: { type: "string", maxLength: 260 }
      }
    },
    detected_traits: {
      type: "array",
      maxItems: 6,
      items: { type: "string", maxLength: 40 }
    },
    suggestions: {
      type: "array",
      minItems: 0,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["mode", "message", "why_it_fits"],
        properties: {
          mode: { enum: ["chill", "playful", "bold", "high_effort"] },
          message: { type: "string", maxLength: 220 },
          why_it_fits: { type: "string", maxLength: 220 }
        }
      }
    },
    next_action: {
      type: "object",
      additionalProperties: false,
      required: ["action", "reason"],
      properties: {
        action: { enum: ["send_dm", "reply_story", "comment", "follow", "react_only", "search_next", "skip", "stay_silent"] },
        reason: { type: "string", maxLength: 220 }
      }
    },
    conversation_summary: { type: "string", maxLength: 260 },
    safety_note: { type: "string", maxLength: 180 }
  }
};
