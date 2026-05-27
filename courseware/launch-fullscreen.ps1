param(
  [switch]$CheckOnly
)

$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Port = 4827
$Url = "http://127.0.0.1:$Port/index.html"

function Resolve-CommandPath {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Candidates,
    [Parameter(Mandatory = $true)]
    [string]$FallbackCommand
  )

  foreach ($candidate in $Candidates) {
    if ($candidate -and (Test-Path -LiteralPath $candidate)) {
      return $candidate
    }
  }

  $command = Get-Command $FallbackCommand -ErrorAction SilentlyContinue

  if ($command) {
    return $command.Source
  }

  return $null
}

$Node = Resolve-CommandPath `
  -Candidates @(
    "$env:ProgramFiles\nodejs\node.exe",
    "${env:ProgramFiles(x86)}\nodejs\node.exe"
  ) `
  -FallbackCommand 'node.exe'

if (-not $Node) {
  throw 'Node.js was not found. Please install Node.js, then run this launcher again.'
}

$Edge = Resolve-CommandPath `
  -Candidates @(
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
  ) `
  -FallbackCommand 'msedge.exe'

if (-not $Edge) {
  throw 'Microsoft Edge was not found. Please install Edge or open index.html manually.'
}

if ($CheckOnly) {
  Write-Host "Node: $Node"
  Write-Host "Edge: $Edge"
  Write-Host "URL: $Url"
  exit 0
}

$ServerScript = Join-Path $Root 'server.cjs'

if (-not (Test-Path -LiteralPath $ServerScript)) {
  throw "Missing server file: $ServerScript"
}

Start-Process `
  -FilePath $Node `
  -ArgumentList @($ServerScript, "$Port") `
  -WorkingDirectory $Root `
  -WindowStyle Hidden | Out-Null

Start-Sleep -Milliseconds 900

$ProfileDir = Join-Path $env:TEMP "vr-ppt-courseware-edge-$Port"
New-Item -ItemType Directory -Path $ProfileDir -Force | Out-Null

Start-Process `
  -FilePath $Edge `
  -ArgumentList @(
    '--kiosk',
    $Url,
    '--edge-kiosk-type=fullscreen',
    '--no-first-run',
    "--user-data-dir=$ProfileDir",
    '--disable-features=Translate'
  ) `
  -WorkingDirectory $Root | Out-Null
