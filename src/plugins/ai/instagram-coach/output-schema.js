export const outputSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "situation_read",
    "exact_message_to_send",
    "specific_detail_referenced",
    "predicted_response",
    "why_not_generic_advice",
    "if_no_reply_in_48h",
    "channel",
    "confidence"
  ],
  properties: {
    situation_read: {
      type: "object",
      required: ["quoted_evidence", "inferred_emotion", "social_stakes"],
      additionalProperties: false,
      properties: {
        quoted_evidence: {
          type: "array",
          minItems: 0,
          maxItems: 3,
          items: { type: "string", maxLength: 120 },
          description: "Verbatim text from the screenshot. Each ≤15 words."
        },
        inferred_emotion: { type: "string", maxLength: 80 },
        social_stakes: { enum: ["low", "medium", "high"] }
      }
    },
    exact_message_to_send: {
      type: "string",
      maxLength: 220,
      description: "Literal paste-able text. No placeholders like [name]. No 'something like'."
    },
    specific_detail_referenced: {
      type: "string",
      description: "The concrete unique-to-this-person noun the message hooks into. MUST appear in quoted_evidence."
    },
    predicted_response: {
      type: "object",
      required: ["likely_reply_text", "probability", "next_move"],
      additionalProperties: false,
      properties: {
        likely_reply_text: { type: "string", maxLength: 200 },
        probability: { type: "number", minimum: 0, maximum: 1 },
        next_move: { type: "string", maxLength: 200 }
      }
    },
    why_not_generic_advice: {
      type: "string",
      minLength: 40,
      maxLength: 400,
      description: "Why generic advice would fail HERE specifically."
    },
    if_no_reply_in_48h: { type: "string", maxLength: 200 },
    channel: {
      enum: ["story_reply", "dm_new", "dm_existing", "comment", "react_only", "stay_silent"]
    },
    confidence: { type: "number", minimum: 0, maximum: 1 }
  }
};
