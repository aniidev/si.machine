$ErrorActionPreference = "Stop"

$envPath = Join-Path $PSScriptRoot "..\.env"
if (Test-Path $envPath) {
  Get-Content $envPath | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#") -or -not $line.Contains("=")) {
      return
    }

    $parts = $line.Split("=", 2)
    $name = $parts[0].Trim()
    $value = $parts[1].Trim().Trim('"').Trim("'")
    if ($name -and -not [Environment]::GetEnvironmentVariable($name, "Process")) {
      [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
  }
}

if (-not $env:GROQ_API_KEY) {
  throw "Set GROQ_API_KEY first: `$env:GROQ_API_KEY='your-key'"
}

$electron = Join-Path $PSScriptRoot "..\node_modules\.bin\electron.cmd"
if (-not (Test-Path $electron)) {
  throw "Electron is not installed. Run npm install after fixing npm, or install dependencies with another package manager."
}

& $electron . --config configs/instawingman.groq.json
