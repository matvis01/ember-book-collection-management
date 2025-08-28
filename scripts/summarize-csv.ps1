param(
  [string]$CsvFile = "process_metrics.csv",
  [string]$ReportFile = "RUNTIME_METRICS_REPORT.md"
)

if (-not (Test-Path $CsvFile)) {
  Write-Error "CSV file not found: $CsvFile"
  exit 1
}

$data = Import-Csv $CsvFile

if ($data.Count -eq 0) {
  Write-Error "No data found in CSV file"
  exit 1
}

$cpuValues = $data | ForEach-Object { [double]$_.CPU_Percent }
$workingSetValues = $data | ForEach-Object { [double]$_.WorkingSet_MB }
$privateValues = $data | ForEach-Object { [double]$_.Private_MB }

$cpuAvg = ($cpuValues | Measure-Object -Average).Average
$cpuMin = ($cpuValues | Measure-Object -Minimum).Minimum
$cpuMax = ($cpuValues | Measure-Object -Maximum).Maximum

$wsAvg = ($workingSetValues | Measure-Object -Average).Average
$wsMin = ($workingSetValues | Measure-Object -Minimum).Minimum
$wsMax = ($workingSetValues | Measure-Object -Maximum).Maximum

$privAvg = ($privateValues | Measure-Object -Average).Average
$privMin = ($privateValues | Measure-Object -Minimum).Minimum
$privMax = ($privateValues | Measure-Object -Maximum).Maximum

$report = @"
# Ember Book Collection Management - Runtime Performance Metrics

## Data Collection
- **Duration**: $($data.Count) seconds
- **Interval**: 1-second sampling
- **Metric Source**: Chrome process monitoring (aggregate)
- **Data Points**: $($data.Count) measurements

## CPU Usage Statistics
- **Average**: $($cpuAvg.ToString("F3", [System.Globalization.CultureInfo]::InvariantCulture))%
- **Minimum**: $($cpuMin.ToString("F3", [System.Globalization.CultureInfo]::InvariantCulture))%
- **Maximum**: $($cpuMax.ToString("F3", [System.Globalization.CultureInfo]::InvariantCulture))%

## Memory Usage Statistics (MB)
### Working Set
- **Average**: $($wsAvg.ToString("F3", [System.Globalization.CultureInfo]::InvariantCulture)) MB
- **Minimum**: $($wsMin.ToString("F3", [System.Globalization.CultureInfo]::InvariantCulture)) MB
- **Maximum**: $($wsMax.ToString("F3", [System.Globalization.CultureInfo]::InvariantCulture)) MB

### Private Memory
- **Average**: $($privAvg.ToString("F3", [System.Globalization.CultureInfo]::InvariantCulture)) MB
- **Minimum**: $($privMin.ToString("F3", [System.Globalization.CultureInfo]::InvariantCulture)) MB
- **Maximum**: $($privMax.ToString("F3", [System.Globalization.CultureInfo]::InvariantCulture)) MB

## Framework Context
- **Framework**: Ember.js (Convention-over-configuration)
- **Build Tool**: Ember CLI
- **Port**: 4200 (typical Ember dev server)
- **Monitoring Target**: Chrome browser processes

## Performance Insights
Generated on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

Raw data available in: $CsvFile
"@

$report | Out-File -FilePath $ReportFile -Encoding UTF8
Write-Host "Report generated: $ReportFile"
