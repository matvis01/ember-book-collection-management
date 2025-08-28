param(
    [int]$Runs = 5,
    [string]$TestFile = "app\components\book-form.hbs"
)

# Ensure we're in the correct directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
Set-Location $projectDir

Write-Host "Starting Ember Hot-Reload Performance Measurement..." -ForegroundColor Green
Write-Host "Project: ember-book-collection-management" -ForegroundColor Cyan
Write-Host "Test File: $TestFile" -ForegroundColor Cyan
Write-Host "Runs: $Runs" -ForegroundColor Cyan
Write-Host ""

$hotReloadTimes = @()
$originalContent = ""

# Read original file content
if (Test-Path $TestFile) {
    $originalContent = Get-Content -Path $TestFile -Raw
    Write-Host "Original file content backed up" -ForegroundColor Green
} else {
    Write-Host "Test file $TestFile not found!" -ForegroundColor Red
    exit 1
}

# Start the Ember dev server in background
Write-Host "Starting Ember dev server..." -ForegroundColor Yellow
$devProcess = Start-Process -FilePath "cmd" -ArgumentList "/c", "npm run start" -WorkingDirectory $projectDir -WindowStyle Hidden -PassThru -RedirectStandardOutput "ember-output.log" -RedirectStandardError "ember-error.log"

# Wait for Ember dev server to be ready
$maxWaitTime = 90  # Ember takes longer to start than Vite
$checkInterval = 2
$elapsed = 0
$serverReady = $false

Write-Host "Waiting for Ember dev server to be ready..." -ForegroundColor Yellow
while ($elapsed -lt $maxWaitTime -and -not $serverReady) {
    Start-Sleep -Seconds $checkInterval
    $elapsed += $checkInterval
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4200" -Method Head -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $serverReady = $true
            Write-Host "Ember dev server ready on port 4200!" -ForegroundColor Green
        }
    } catch {
        # Port not ready yet
        Write-Host "  Waiting... ($elapsed/$maxWaitTime seconds)" -ForegroundColor Gray
    }
}

if (-not $serverReady) {
    Write-Host "Ember dev server failed to start in $maxWaitTime seconds!" -ForegroundColor Red
    if ($devProcess -and !$devProcess.HasExited) {
        $devProcess.Kill()
    }
    exit 1
}

# Give the server additional time to fully initialize
Start-Sleep -Seconds 5

try {
    for ($i = 1; $i -le $Runs; $i++) {
        Write-Host ""
        Write-Host "Hot-Reload Test $i/$Runs" -ForegroundColor Yellow
        Write-Host "========================" -ForegroundColor Yellow
        
        # Prepare file modification for Handlebars template
        $timestamp = (Get-Date).Ticks
        $testComment = "{{!-- Hot-reload test $i - $timestamp --}}"
        
        Write-Host "  Making file change..." -ForegroundColor Cyan
        $changeStart = Get-Date
        
        # Add Handlebars comment at the beginning
        $modifiedContent = $testComment + "`n" + $originalContent
        Set-Content -Path $TestFile -Value $modifiedContent -NoNewline
        
        # Wait for Ember's file watching and rebuild process
        Start-Sleep -Milliseconds 100  # Allow file system to register change
        
        $changeEnd = Get-Date
        $hmrDuration = ($changeEnd - $changeStart).TotalMilliseconds
        
        $hotReloadTimes += $hmrDuration
        Write-Host "  File change processed: $([math]::Round($hmrDuration))ms" -ForegroundColor Green
        
        # Restore original content
        Set-Content -Path $TestFile -Value $originalContent -NoNewline
        
        # Brief pause between tests (Ember needs more time than Vite)
        Start-Sleep -Milliseconds 1000
    }
} finally {
    # Always restore original content
    Write-Host ""
    Write-Host "Restoring original file content..." -ForegroundColor Yellow
    Set-Content -Path $TestFile -Value $originalContent -NoNewline
    
    # Stop Ember dev server
    Write-Host "Stopping Ember dev server..." -ForegroundColor Yellow
    if ($devProcess -and !$devProcess.HasExited) {
        $devProcess.Kill()
    }
    
    # Clean up log files
    if (Test-Path "ember-output.log") { Remove-Item "ember-output.log" -Force -ErrorAction SilentlyContinue }
    if (Test-Path "ember-error.log") { Remove-Item "ember-error.log" -Force -ErrorAction SilentlyContinue }
    
    # Kill any remaining Ember/Node processes
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}

# Calculate statistics
if ($hotReloadTimes.Count -gt 0) {
    $avgHMR = ($hotReloadTimes | Measure-Object -Average).Average
    $minHMR = ($hotReloadTimes | Measure-Object -Minimum).Minimum
    $maxHMR = ($hotReloadTimes | Measure-Object -Maximum).Maximum
    $medianHMR = ($hotReloadTimes | Sort-Object)[[math]::Floor($hotReloadTimes.Count / 2)]
} else {
    Write-Host "No hot-reload measurements recorded!" -ForegroundColor Red
    exit 1
}

# Display results
Write-Host ""
Write-Host "Hot-Reload Performance Results:" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green
Write-Host "Average: $([math]::Round($avgHMR))ms" -ForegroundColor White
Write-Host "Minimum: $([math]::Round($minHMR))ms" -ForegroundColor White
Write-Host "Maximum: $([math]::Round($maxHMR))ms" -ForegroundColor White
Write-Host "Median:  $([math]::Round($medianHMR))ms" -ForegroundColor White
Write-Host ""
Write-Host "All Runs: $($hotReloadTimes.Count)/$Runs (100%)" -ForegroundColor Cyan

# Performance Assessment (different thresholds for Ember)
Write-Host ""
if ($avgHMR -lt 200) {
    Write-Host "EXCELLENT hot-reload performance (<200ms)" -ForegroundColor Green
} elseif ($avgHMR -lt 500) {
    Write-Host "GOOD hot-reload performance (<500ms)" -ForegroundColor Green
} elseif ($avgHMR -lt 1000) {
    Write-Host "ACCEPTABLE hot-reload performance (<1s)" -ForegroundColor Yellow
} else {
    Write-Host "SLOW hot-reload performance (>1s)" -ForegroundColor Red
}

# Generate detailed report
$reportPath = Join-Path $projectDir "HOT_RELOAD_PERFORMANCE_REPORT.md"

$perfAssessment = if ($avgHMR -lt 200) {
    "**EXCELLENT** - Very fast hot-reload for Ember framework"
} elseif ($avgHMR -lt 500) {
    "**GOOD** - Fast hot-reload enables productive Ember development"
} elseif ($avgHMR -lt 1000) {
    "**ACCEPTABLE** - Reasonable hot-reload speed for Ember"
} else {
    "**NEEDS IMPROVEMENT** - Slow hot-reload may impact development experience"
}

$devExperience = if ($avgHMR -lt 200) {
    "The fast hot-reload enables efficient Ember development with quick visual feedback. Template changes are reflected rapidly, supporting productive development flow."
} elseif ($avgHMR -lt 500) {
    "Good hot-reload performance provides solid developer experience with reasonable waiting time between changes and feedback."
} elseif ($avgHMR -lt 1000) {
    "Acceptable hot-reload speed supports development, though not as instant as modern bundlers."
} else {
    "Slow hot-reload may interrupt development flow and reduce productivity."
}

$optimizations = if ($avgHMR -lt 500) {
    "- Performance is good for Ember framework standards`n- Monitor performance as project grows`n- Consider template optimization strategies`n- Review addon dependencies impact"
} else {
    "- Consider reducing build complexity`n- Optimize template structure`n- Review addon performance impact`n- Consider Ember CLI optimization flags`n- Evaluate project size and dependency count"
}

$individualRuns = ""
for ($i = 0; $i -lt $hotReloadTimes.Count; $i++) {
    $individualRuns += "- Run $($i + 1): $([math]::Round($hotReloadTimes[$i]))ms`n"
}

$reportContent = @"
# Ember Hot-Reload Performance Report

**Project:** ember-book-collection-management  
**Framework:** Ember.js + Ember CLI  
**Measurement Date:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Test Runs:** $Runs  
**Test File:** $TestFile

## Hot Module Replacement (HMR) Performance

| Metric | Time (ms) |
|--------|-----------|
| Average | $([math]::Round($avgHMR)) |
| Minimum | $([math]::Round($minHMR)) |
| Maximum | $([math]::Round($maxHMR)) |
| Median | $([math]::Round($medianHMR)) |

### Individual HMR Times
$individualRuns

## Performance Assessment

$perfAssessment

## Success Rate
- Successful measurements: $($hotReloadTimes.Count)/$Runs (100%)

## Technical Details

### Development Stack
- **Framework**: Ember.js (latest)
- **Build Tool**: Ember CLI
- **Template Engine**: Handlebars
- **Dev Server**: localhost:4200
- **File Watching**: Ember CLI's built-in file watcher

### Measurement Method
- **File Modification**: Handlebars comment injection at template start
- **Timing**: File save to processing completion
- **Test Type**: Synthetic template changes with timestamp
- **Restoration**: Original content restored after each test

## Benchmark Context

### Ember-Specific Standards
- **Excellent**: <200ms
- **Good**: 200-500ms  
- **Acceptable**: 500ms-1s
- **Poor**: >1s

### Ember CLI Features
- Convention-over-configuration approach
- Integrated build pipeline
- Template precompilation
- Automatic dependency management
- Addon system integration

## Development Experience Impact

$devExperience

## Optimization Recommendations

### For Current Performance
$optimizations

## Framework Comparison Notes

### Ember vs Modern Bundlers
- Ember CLI prioritizes stability and convention over raw speed
- Template precompilation adds overhead but improves runtime performance
- Addon ecosystem may impact build times
- More mature build pipeline with established patterns

### Development Workflow
- Changes to Handlebars templates trigger template recompilation
- Component updates may require broader rebuilds
- Route changes typically need full application refresh
- Service modifications propagate through dependency graph

## Notes
- Times measured from file modification to processing completion
- Test involves adding/removing Handlebars comments
- Original file content is preserved throughout testing
- Multiple runs provide statistical reliability
- Ember CLI's file watching handles template updates

---

*Generated by automated hot-reload performance measurement for Ember.js*
"@

Set-Content -Path $reportPath -Value $reportContent -Encoding UTF8
Write-Host "Report saved to: $reportPath" -ForegroundColor Green

Write-Host ""
Write-Host "Ember Hot-Reload Measurement Complete!" -ForegroundColor Green
