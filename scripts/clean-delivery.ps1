param([switch]$Apply)
$ErrorActionPreference = 'Stop'
$workspace = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..')).TrimEnd('\')
$prefix = $workspace + [IO.Path]::DirectorySeparatorChar
$targets = @(
  '.local/visual', 'Frontend/.local', 'Frontend/dist',
  'Frontend/scripts/reset-project.js',
  'Frontend/assets/images/expo-badge-white.png', 'Frontend/assets/images/expo-badge.png',
  'Frontend/assets/images/expo-logo.png', 'Frontend/assets/images/logo-glow.png',
  'Frontend/assets/images/react-logo.png', 'Frontend/assets/images/react-logo@2x.png',
  'Frontend/assets/images/react-logo@3x.png', 'Frontend/assets/images/tutorial-web.png',
  'Frontend/assets/images/tabIcons'
)
foreach ($folder in @('Backend/.local', 'Backend/.local/verification')) {
  $parent = Join-Path $workspace $folder
  if (Test-Path -LiteralPath $parent) {
    foreach ($entry in Get-ChildItem -LiteralPath $parent -Directory -Force) {
      if ($entry.Name -match '^(demo-seed-|tapcampus_delivery_[0-9]+$)') { $targets += $entry.FullName }
    }
  }
}
$report = @()
foreach ($target in $targets) {
  if ([IO.Path]::IsPathRooted($target)) { $absolute = [IO.Path]::GetFullPath($target) }
  else { $absolute = [IO.Path]::GetFullPath((Join-Path $workspace $target)) }
  if (-not $absolute.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase)) { throw "Ruta fuera del workspace: $absolute" }
  if (-not (Test-Path -LiteralPath $absolute)) { continue }
  $item = Get-Item -LiteralPath $absolute -Force
  $entries = @($item)
  if ($item.PSIsContainer) { $entries += @(Get-ChildItem -LiteralPath $absolute -Recurse -Force) }
  if ($entries | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }) { throw "No se borran enlaces: $absolute" }
  $files = @($entries | Where-Object { -not $_.PSIsContainer })
  $bytes = ($files | Measure-Object -Property Length -Sum).Sum
  if ($null -eq $bytes) { $bytes = 0 }
  $relative = $absolute.Substring($prefix.Length).Replace('\', '/')
  $row = [ordered]@{ path=$relative; files=$files.Count; bytes=[long]$bytes; removed=$false }
  if ($Apply) { Remove-Item -LiteralPath $absolute -Recurse -Force; $row.removed = $true }
  $report += [pscustomobject]$row
}
$summary = [ordered]@{
  applied=[bool]$Apply
  targets=$report.Count
  files=($report | Measure-Object -Property files -Sum).Sum
  bytes=($report | Measure-Object -Property bytes -Sum).Sum
  preserved=@('node_modules', '.env', 'Backend/.local/backups', 'Backend/.local/demo-access.json', 'Backend/uploads', 'specs', 'docs', '.agents', '.git')
  details=$report
}
if ($Apply) {
  $destination = Join-Path $workspace 'specs/0046-seed-entrega-y-limpieza/evidence/cleanup.json'
  $summary | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $destination -Encoding UTF8
}
$summary | ConvertTo-Json -Depth 6
