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
$memValues = $data | ForEach-Object { [double]$_.WorkingSet_MB }

$cpuAvg = ($cpuValues | Measure-Object -Average).Average
$cpuMin = ($cpuValues | Measure-Object -Minimum).Minimum
$cpuMax = ($cpuValues | Measure-Object -Maximum).Maximum

$memAvg = ($memValues | Measure-Object -Average).Average
$memMin = ($memValues | Measure-Object -Minimum).Minimum
$memMax = ($memValues | Measure-Object -Maximum).Maximum

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
- **Average**: $($memAvg.ToString("F3", [System.Globalization.CultureInfo]::InvariantCulture)) MB
- **Minimum**: $($memMin.ToString("F3", [System.Globalization.CultureInfo]::InvariantCulture)) MB
- **Maximum**: $($memMax.ToString("F3", [System.Globalization.CultureInfo]::InvariantCulture)) MB

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
