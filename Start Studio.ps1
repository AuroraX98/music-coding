param([switch]$SkipOpen)
$ErrorActionPreference = 'Stop'
$studioRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$studioDist = Join-Path $studioRoot 'dist'
$studioServer = Join-Path $studioRoot 'server.mjs'
$studioOwnerFile = Join-Path $studioRoot '.studio-server.json'
$studioUrl = 'http://127.0.0.1:5173/'
if (-not (Test-Path -LiteralPath (Join-Path $studioDist 'index.html') -PathType Leaf)) { throw "Built Studio files were not found in $studioDist. Run the build first." }
if (-not (Test-Path -LiteralPath $studioServer -PathType Leaf)) { throw "Studio server was not found at $studioServer." }
$studioNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
if (-not (Test-Path -LiteralPath $studioNode -PathType Leaf)) {
    $studioNodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
    if (-not $studioNodeCommand) { throw 'Node.js was not found. Install Node.js or restore the Codex bundled runtime.' }
    $studioNode = $studioNodeCommand.Source
}
$studioExpectedDist = (& $studioNode -e "process.stdout.write(require('node:fs').realpathSync(process.argv[1]))" $studioDist | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or -not $studioExpectedDist) { throw 'The built Studio folder could not be resolved.' }
function Read-StudioHealth {
    try {
        $studioResponse = Invoke-WebRequest -UseBasicParsing -Uri ($studioUrl + '__studio_health') -TimeoutSec 1
        if ($studioResponse.StatusCode -eq 200) { return ($studioResponse.Content | ConvertFrom-Json) }
    } catch {}
    return $null
}
function Test-StudioIdentity($studioHealth) {
    return $null -ne $studioHealth -and $studioHealth.app -eq 'plain-music-studio' -and $studioHealth.version -eq 1 -and
        [string]::Equals([string]$studioHealth.dist, $studioExpectedDist, [StringComparison]::OrdinalIgnoreCase)
}
function Test-StudioPortInUse {
    $studioConnection = New-Object System.Net.Sockets.TcpClient
    try { $studioConnection.Connect('127.0.0.1', 5173); return $true } catch { return $false } finally { $studioConnection.Dispose() }
}
$studioHealth = Read-StudioHealth
if (-not (Test-StudioIdentity $studioHealth)) {
    if ($null -ne $studioHealth -or (Test-StudioPortInUse)) { throw 'Port 5173 is already used by another app or a different Studio folder. Close that server, then start this Studio again.' }
    $studioArguments = @(('"' + $studioServer + '"'), ('"' + $studioDist + '"'))
    $studioProcess = Start-Process -FilePath $studioNode -ArgumentList $studioArguments -WorkingDirectory $studioRoot -WindowStyle Hidden -PassThru
    $studioReady = $false
    for ($studioAttempt = 0; $studioAttempt -lt 30; $studioAttempt++) {
        Start-Sleep -Milliseconds 200
        $studioHealth = Read-StudioHealth
        if ((Test-StudioIdentity $studioHealth) -and $studioHealth.pid -eq $studioProcess.Id) { $studioReady = $true; break }
        if ($studioProcess.HasExited) { throw 'Studio server could not start. Port 5173 may already be in use.' }
    }
    if (-not $studioReady) { throw 'Studio server did not become ready. Check the built files and port 5173, then try again.' }
    [ordered]@{
        pid = $studioProcess.Id
        started = $studioProcess.StartTime.ToUniversalTime().Ticks.ToString()
        node = $studioProcess.Path
        dist = $studioExpectedDist
        server = $studioServer
    } | ConvertTo-Json | Set-Content -LiteralPath $studioOwnerFile -Encoding UTF8
}
Write-Output ('Studio is ready at ' + $studioUrl)
if (-not $SkipOpen) {
    $studioChrome = @(
        "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
        "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
        "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
    ) | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
    if (-not $studioChrome) {
        throw "Google Chrome was not found. Install Chrome or open $studioUrl in Chrome manually."
    }
    Start-Process -FilePath $studioChrome -ArgumentList $studioUrl
}
