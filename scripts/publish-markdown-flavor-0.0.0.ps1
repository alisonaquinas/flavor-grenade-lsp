param(
  [string]$PackageName = "markdown-flavor-detection",
  [string]$Version = "0.0.0",
  [string]$Otp
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$packageRoot = Join-Path $repoRoot "packages/markdown-flavor"
$publishRoot = Join-Path $env:TEMP "markdown-flavor-0.0.0-publish"

Push-Location $repoRoot
try {
  Write-Host "Checking npm login..."
  $whoami = npm whoami
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($whoami)) {
    throw "npm is not logged in. Run: npm login"
  }
  Write-Host "npm user: $whoami"

  Write-Host "Building package..."
  bun run --cwd packages/markdown-flavor build
  if ($LASTEXITCODE -ne 0) {
    throw "Package build failed."
  }

  Write-Host "Preparing temporary publish directory: $publishRoot"
  Remove-Item -LiteralPath $publishRoot -Recurse -Force -ErrorAction SilentlyContinue
  New-Item -ItemType Directory -Path $publishRoot | Out-Null

  Copy-Item -Recurse -LiteralPath (Join-Path $packageRoot "dist") -Destination $publishRoot
  Copy-Item -LiteralPath (Join-Path $packageRoot "README.md") -Destination $publishRoot
  Copy-Item -LiteralPath (Join-Path $packageRoot "LICENSE") -Destination $publishRoot
  Copy-Item -LiteralPath (Join-Path $packageRoot "package.json") -Destination $publishRoot

  $packageJsonPath = Join-Path $publishRoot "package.json"
  $packageJson = Get-Content -LiteralPath $packageJsonPath -Raw | ConvertFrom-Json -Depth 50
  $packageJson.name = $PackageName
  $packageJson.version = $Version
  $packageJson.PSObject.Properties.Remove("scripts")

  if ($packageJson.exports."." -and $packageJson.exports.".".PSObject.Properties["bun"]) {
    $packageJson.exports.".".PSObject.Properties.Remove("bun")
  }
  if ($packageJson.exports."./node" -and $packageJson.exports."./node".PSObject.Properties["bun"]) {
    $packageJson.exports."./node".PSObject.Properties.Remove("bun")
  }

  $packageJson | ConvertTo-Json -Depth 50 | Set-Content -LiteralPath $packageJsonPath -Encoding utf8

  Write-Host "Package metadata to publish:"
  Get-Content -LiteralPath $packageJsonPath

  Write-Host "Publishing $PackageName@$Version..."
  if ([string]::IsNullOrWhiteSpace($Otp)) {
    npm publish $publishRoot --access public
  } else {
    npm publish $publishRoot --access public --otp $Otp
  }
} finally {
  Pop-Location
}
