# AI Screen Assistant Template

A reusable base framework for local desktop apps that capture screen or text input, process it with OCR or vision modules, reason with an AI provider, and display results in an overlay, web panel, or CLI.

This is intentionally a template, not a single-purpose assistant. Swap config and plugins to build different apps.

## Architecture

```text
Input Plugin -> Processing Plugin -> AI Provider Plugin -> Output Plugin
       \              \                    \                 \
        config-driven modules registered in a shared plugin registry
```

Core layers:

- `src/core`: config loading, plugin registry, pipeline orchestration, shared contracts.
- `src/plugins/input`: input sources such as text files, image files, screen capture placeholders, and Electron desktop capture.
- `src/plugins/processing`: raw text, mock OCR, and vision passthrough processors.
- `src/plugins/ai`: echo, OpenAI-compatible, and local HTTP model providers.
- `src/plugins/output`: CLI, web panel, and Electron overlay outputs.
- `src/ui/electron`: optional Electron shell for overlay/panel style apps.
- `configs`: reusable app definitions.

## Run Locally

The CLI sample runs with Node only:

```bash
node src/cli.js --config configs/sample.cli.json
```

On Windows PowerShell you can also run:

```powershell
.\scripts\run-cli.ps1
```

Smoke test:

```bash
node scripts/smoke-test.js
```

Electron UI requires dependencies:

```bash
npm install
npm run dev
```

`npm run dev` launches the Groq social coach. For the no-key capture demo, use:

```bash
npm run demo
```

If the global `npm` command is broken but `node_modules` already exists, bypass npm:

```powershell
.\scripts\run-electron.ps1
```

If your package manager is unavailable, the core framework still runs through `node src/cli.js`.

## Configuration

Configs define the whole app behavior:

```json
{
  "app": { "name": "Text Summary Assistant" },
  "input": { "type": "text-file", "options": { "path": "examples/input/sample-note.txt" } },
  "processing": { "type": "raw-text" },
  "ai": { "type": "echo", "options": { "prefix": "Template response:" } },
  "output": { "type": "cli" }
}
```

The default Electron config captures the screen and shows a preview. With the built-in `echo` provider it confirms capture; to actually read visible text and reason over the screenshot, use a vision-capable provider such as `configs/sample.screen-openai.json`.

```powershell
$env:OPENAI_API_KEY="your-key"
.\node_modules\.bin\electron.cmd . --config configs/sample.screen-openai.json
```

For a social-media coaching app:

```powershell
$env:OPENAI_API_KEY="your-key"
.\scripts\run-social-coach.ps1
```

Click `Watch` to run repeated screen checks. Change `output.options.intervalMs` in the config to control how often it looks at the screen.

Groq is also supported through the same OpenAI-compatible provider:

```powershell
$env:GROQ_API_KEY="your-key"
.\scripts\run-social-coach-groq.ps1
```

Or create a `.env` file:

```text
GROQ_API_KEY=your-key
```

Then run:

```powershell
.\scripts\run-social-coach-groq.ps1
```

## Plugin Contract

Each plugin exports:

```js
export default {
  type: "plugin-id",
  kind: "input | processing | ai | output",
  create(context, options) {
    return {
      async run(payload) {
        return payload;
      }
    };
  }
};
```

Input plugins expose `capture()`, processing plugins expose `process(input)`, AI plugins expose `complete(processed)`, and output plugins expose `render(result, context)`.

## Extending

1. Add a new plugin file under the matching `src/plugins/*` folder.
2. Export `type`, `kind`, and `create`.
3. Register it in that folder's `index.js`.
4. Reference the plugin `type` in a config file.

For example, to add a Claude provider, create `src/plugins/ai/claude.js`, register it in `src/plugins/ai/index.js`, then set:

```json
{
  "ai": {
    "type": "claude",
    "options": {
      "model": "claude-...",
      "apiKeyEnv": "ANTHROPIC_API_KEY"
    }
  }
}
```

## Design Notes

- The core pipeline never imports a provider directly. It asks the registry for configured plugin instances.
- Every plugin receives the same `context`, including `config`, `logger`, `events`, and optional Electron objects.
- AI providers are replaceable: OpenAI-compatible APIs, Claude-style providers, local HTTP servers, or simple deterministic test providers.
- UI outputs are replaceable: CLI for automation, web panel for local browser use, Electron overlay for desktop apps.
