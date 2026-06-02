param(
  [string]$Message = "Update wiki",
  [switch]$UpdateMainRepoPointer,
  [string]$MainRepoMessage = "Update wiki submodule pointer"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$wikiPath = Join-Path $repoRoot "wiki"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "git is required but was not found in PATH."
}

if (-not (Test-Path $wikiPath)) {
  throw "Wiki submodule not found at '$wikiPath'."
}

$wikiStatus = git -C $wikiPath status --short
if ($LASTEXITCODE -ne 0) {
  throw "Failed to read wiki status."
}

if (-not $wikiStatus) {
  Write-Host "No wiki changes to publish."
  exit 0
}

git -C $wikiPath add .
if ($LASTEXITCODE -ne 0) {
  throw "Failed to stage wiki changes."
}

git -C $wikiPath commit -m $Message
if ($LASTEXITCODE -ne 0) {
  throw "Failed to commit wiki changes."
}

git -C $wikiPath push origin master
if ($LASTEXITCODE -ne 0) {
  throw "Failed to push wiki changes to origin/master."
}

Write-Host "Wiki changes pushed to GitHub."

if ($UpdateMainRepoPointer) {
  git -C $repoRoot add wiki
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to stage wiki submodule pointer in main repo."
  }

  $staged = git -C $repoRoot diff --cached --name-only
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to inspect staged changes in main repo."
  }

  if ($staged -match '(^|\r?\n)wiki(\r?\n|$)') {
    git -C $repoRoot commit -m $MainRepoMessage
    if ($LASTEXITCODE -ne 0) {
      throw "Failed to commit wiki submodule pointer in main repo."
    }
    Write-Host "Main repo updated with new wiki submodule pointer."
  }
  else {
    Write-Host "No main repo submodule pointer update was needed."
  }
}
