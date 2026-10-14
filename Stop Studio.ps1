$ErrorActionPreference = 'Stop'
$studioRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$studioOwnerFile = Join-Path $studioRoot '.studio-server.json'
if (-not (Test-Path -LiteralPath $studioOwnerFile -PathType Leaf)) { Write-Output 'This folder has no recorded Studio server to stop.'; exit 0 }
$studioOwner = Get-Content -LiteralPath $studioOwnerFile -Raw | ConvertFrom-Json
$studioDist = (Resolve-Path -LiteralPath (Join-Path $studioRoot 'dist')).ProviderPath
$studioServer = Join-Path $studioRoot 'server.mjs'
if (-not [string]::Equals([string]$studioOwner.server, $studioServer, [StringComparison]::OrdinalIgnoreCase)) { throw 'The server record belongs to a different Studio folder.' }
$studioProcess = Get-Process -Id $studioOwner.pid -ErrorAction SilentlyContinue
if (-not $studioProcess) { Remove-Item -LiteralPath $studioOwnerFile; Write-Output 'Studio is already stopped.'; exit 0 }
if ($studioProcess.StartTime.ToUniversalTime().Ticks.ToString() -ne $studioOwner.started -or
    -not [string]::Equals([string]$studioProcess.Path, [string]$studioOwner.node, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'The recorded process no longer matches this Studio server. No process was stopped.'
}
$studioExpectedDist = (& $studioOwner.node -e "process.stdout.write(require('node:fs').realpathSync(process.argv[1]))" $studioDist | Out-String).Trim()
if ($LASTEXITCODE -ne 0) { throw 'The Studio folder could not be verified. No process was stopped.' }
$studioResponse = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:5173/__studio_health' -TimeoutSec 2
$studioHealth = $studioResponse.Content | ConvertFrom-Json
if ($studioHealth.app -ne 'plain-music-studio' -or $studioHealth.version -ne 1 -or $studioHealth.pid -ne $studioProcess.Id -or
    -not [string]::Equals([string]$studioHealth.dist, $studioExpectedDist, [StringComparison]::OrdinalIgnoreCase) -or
    -not [string]::Equals([string]$studioOwner.dist, $studioExpectedDist, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Port 5173 does not match the recorded Studio server. No process was stopped.'
}
Stop-Process -InputObject $studioProcess
Remove-Item -LiteralPath $studioOwnerFile
Write-Output 'Studio server stopped.'
