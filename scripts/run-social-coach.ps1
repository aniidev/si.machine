$ErrorActionPreference = "Stop"

if (-not $env:OPENAI_API_KEY) {
  throw "Set OPENAI_API_KEY first: `$env:OPENAI_API_KEY='your-key'"
}

$electron = Join-Path $PSScriptRoot "..\node_modules\.bin\electron.cmd"
if (-not (Test-Path $electron)) {
  throw "Electron is not installed. Run npm install after fixing npm, or install dependencies with another package manager."
}

& $electron . --config configs/social-media-coach.openai.json
