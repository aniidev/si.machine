# Architecture

## Module Breakdown

### Core

- `config-loader.js`: reads and validates a JSON app definition.
- `plugin-registry.js`: stores plugin factories by layer and type.
- `pipeline.js`: creates configured plugins and runs capture, processing, AI, and output steps.
- `events.js`: small event bus for UI shells and logs.

### Inputs

Inputs normalize external capture into a common payload:

```js
{
  sourceType: "text | image | screen | window",
  contentType: "text/plain | image/png",
  data: "...",
  metadata: {}
}
```

### Processing

Processors convert captured input into model-ready content:

```js
{
  text: "...",
  images: [],
  metadata: {}
}
```

### AI Providers

Providers convert processed content into assistant results:

```js
{
  text: "...",
  raw: {},
  metadata: {}
}
```

### Outputs

Outputs decide where the result is displayed: CLI, Electron overlay, local web panel, tray window, or another UI.

## Plugin System

Plugins are plain JavaScript modules registered at startup. The core only knows their `kind`, `type`, and factory. This keeps each app definition replaceable through config.

Kinds:

- `input`
- `processing`
- `ai`
- `output`

The registry supports many implementations per kind, and one app config selects one implementation from each layer.
