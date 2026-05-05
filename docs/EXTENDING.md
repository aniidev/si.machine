# Extending The Template

## Add An Input Source

Create `src/plugins/input/my-input.js`:

```js
export default {
  type: "my-input",
  kind: "input",
  create(context, options) {
    return {
      async capture() {
        return {
          sourceType: "text",
          contentType: "text/plain",
          data: "captured content",
          metadata: {}
        };
      }
    };
  }
};
```

Register it in `src/plugins/input/index.js`, then set `input.type` to `my-input`.

## Add OCR

Replace `mock-ocr` with a real processor. A production implementation could wrap Tesseract, PaddleOCR, cloud OCR, or an on-device vision model. Keep OCR details inside the processor so input and AI providers do not change.

## Add An AI Provider

AI plugins receive normalized text/images and return normalized text. This makes it easy to support OpenAI-compatible APIs, Claude, Ollama, LM Studio, or custom services.

## Add A UI

Output plugins receive the final model result. You can add a tray popup, always-on-top overlay, web socket panel, native notification, or CLI formatter without changing the pipeline.
