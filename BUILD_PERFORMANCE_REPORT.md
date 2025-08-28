# Ember Book Collection Management - Build Performance Report

*Generated on: 2025-08-25 17:38:33*

## Executive Summary

Performance analysis of Ember Book Collection Management application build and startup times across 3 test runs.

### Key Performance Metrics

| Operation | Average | Minimum | Maximum | Median | Unit |
|-----------|---------|---------|---------|--------|------|
| **npm run build** | 54960 | 30623 | 101231 | 33027 | ms |
| **npm start** | 84932 | 77888 | 89409 | 87499 | ms |

### Performance Grades

| Operation | Time (avg) | Grade | Assessment |
|-----------|------------|-------|------------|
| **Production Build** | 55s | Slow | Build optimization needed |
| **Dev Server Start** | 84.9s | Slow | Slow development startup |

## Technical Analysis

### Project Configuration
- **Framework**: Ember.js (Convention-over-configuration)
- **Build Tool**: Ember CLI
- **Package Manager**: npm
- **Bundle Target**: ES2020+

### Build Characteristics
- **Build Consistency**: Variable (Â±35.3s variance)
- **Dev Server Reliability**: 100% success rate

## Detailed Results

### Raw Measurements (milliseconds)

#### npm run build  
- Run: 101231 ms - Run: 33027 ms - Run: 30623 ms

#### npm start (startup)
- Run: 89409 ms - Run: 87499 ms - Run: 77888 ms

## Optimization Recommendations

### Build Performance
- Enable Ember CLI build optimization features
- Consider code splitting with dynamic imports
- Review addon dependencies for build impact

### Development Experience
- Optimize Ember CLI dev server configuration
- Enable live-reload optimizations
- Consider reducing addon overhead

## Framework Comparison Context

### Industry Benchmarks
- **Good build time**: <10s  
- **Good dev startup**: <10s (Ember typically slower due to conventions)

### Current Status
- **Build Speed**: Below industry standard  
- **Dev Experience**: Below industry standard

### Ember-Specific Notes
- Ember CLI includes comprehensive tooling (testing, linting, builds) which can affect startup times
- Convention-over-configuration approach trades some speed for developer productivity
- Build times include full optimization and asset pipeline processing

---

*This report was generated using automated build performance measurement tools.*

## Reproduction Commands

To reproduce these measurements:

`powershell
# Run measurement
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\measure-build-times.ps1

# Run with custom parameters  
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\measure-build-times.ps1 -Runs 5 -OutFile CUSTOM_BUILD_REPORT.md
`
