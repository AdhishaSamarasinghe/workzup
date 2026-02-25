$ErrorActionPreference = "SilentlyContinue"

$workspace = Get-Location
$lockPath = Join-Path $workspace ".next\dev\lock"

$nextPids = Get-CimInstance Win32_Process |
    Where-Object { $_.Name -eq "node.exe" -and $_.CommandLine -match "next\\dist\\bin\\next" } |
    Select-Object -ExpandProperty ProcessId

if ($nextPids) {
    Write-Host "Stopping Next.js processes: $($nextPids -join ', ')"
    $nextPids | ForEach-Object {
        Stop-Process -Id $_ -Force
    }
} else {
    Write-Host "No running Next.js process found."
}

if (Test-Path $lockPath) {
    Remove-Item $lockPath -Force
    Write-Host "Removed lock file: $lockPath"
} else {
    Write-Host "No lock file found at: $lockPath"
}

Write-Host "Starting Next.js dev server on port 3000..."
npm run dev
