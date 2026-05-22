# Instagram Coach AI Plugin

`instagram-coach` wraps the OpenAI-compatible provider with a constraint pipeline:

1. Strict JSON generation using `output-schema.js`.
2. Banned phrase rejection in `banned-phrases.js`.
3. Programmatic 7-part specificity scoring in `rubric.js`.
4. Overlay text formatting in `formatter.js`.

## Add A Few-Shot Example

Edit `few-shot-examples.js` and add:

```js
{
  scenario: "Short label",
  screenshotDescription: "What is visible on screen.",
  bad_advice: "The generic advice to avoid.",
  good_advice_json: {
    "...": "Must match output-schema.js exactly"
  }
}
```

Rules for good examples:

- `exact_message_to_send` must be paste-able.
- `specific_detail_referenced` must appear in `quoted_evidence`.
- Include a concrete noun from `quoted_evidence` in the message.
- Explain why generic advice fails in this exact situation.

Restart the app after changing examples because they are embedded in the system prompt at startup.
