const fs = require('fs');
const path = require('path');

function getFileExtension(filename) {
  return path.extname(filename).toLowerCase();
}

function countLines(content, fileExtension) {
  const lines = content.split('\n');
  let sourceLines = 0;
  let commentLines = 0;
  let emptyLines = 0;
  let totalLines = lines.length;

  let inBlockComment = false;
  let inHandlebarsComment = false;

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed === '') {
      emptyLines++;
    } else if (fileExtension === '.ts' || fileExtension === '.js') {
      // TypeScript/JavaScript comment detection
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed === '/**' || trimmed === '*/' || trimmed.startsWith('* ')) {
        commentLines++;
      } else if (trimmed.startsWith('/*') && trimmed.endsWith('*/')) {
        commentLines++;
      } else if (trimmed.startsWith('/*') || trimmed.startsWith('/**')) {
        commentLines++;
        inBlockComment = true;
      } else if (trimmed.endsWith('*/') && inBlockComment) {
        commentLines++;
        inBlockComment = false;
      } else if (inBlockComment) {
        commentLines++;
      } else {
        sourceLines++;
      }
    } else if (fileExtension === '.hbs') {
      // Handlebars comment detection
      if (trimmed.startsWith('{{!--') && trimmed.endsWith('--}}')) {
        commentLines++;
      } else if (trimmed.startsWith('{{!--')) {
        commentLines++;
        inHandlebarsComment = true;
      } else if (trimmed.endsWith('--}}') && inHandlebarsComment) {
        commentLines++;
        inHandlebarsComment = false;
      } else if (inHandlebarsComment) {
        commentLines++;
      } else if (trimmed.startsWith('{{!') && trimmed.endsWith('}}')) {
        commentLines++;
      } else {
        sourceLines++;
      }
    } else if (fileExtension === '.html') {
      // HTML comment detection
      if (trimmed.startsWith('<!--') && trimmed.endsWith('-->')) {
        commentLines++;
      } else if (trimmed.startsWith('<!--')) {
        commentLines++;
        inBlockComment = true;
      } else if (trimmed.endsWith('-->') && inBlockComment) {
        commentLines++;
        inBlockComment = false;
      } else if (inBlockComment) {
        commentLines++;
      } else {
        sourceLines++;
      }
    } else if (fileExtension === '.css') {
      // CSS comment detection
      if (trimmed.startsWith('/*') && trimmed.endsWith('*/')) {
        commentLines++;
      } else if (trimmed.startsWith('/*')) {
        commentLines++;
        inBlockComment = true;
      } else if (trimmed.endsWith('*/') && inBlockComment) {
        commentLines++;
        inBlockComment = false;
      } else if (inBlockComment) {
        commentLines++;
      } else {
        sourceLines++;
      }
    } else {
      // Default: treat as source
      sourceLines++;
    }
  }

  return {
    total: totalLines,
    source: sourceLines,
    comments: commentLines,
    empty: emptyLines
  };
}

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const extension = getFileExtension(filePath);
    const stats = countLines(content, extension);
    
    return {
      path: filePath,
      extension: extension,
      ...stats
    };
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}:`, error.message);
    return null;
  }
}

function shouldAnalyzeFile(filePath) {
  const extension = getFileExtension(filePath);
  const allowedExtensions = ['.ts', '.js', '.hbs', '.html', '.css', '.json'];
  
  // Skip certain files/directories
  const excludePatterns = [
    'node_modules',
    'dist',
    'tmp',
    '.git',
    'coverage',
    '.vscode',
    '.github',
    'public',
    'vendor',
    'package-lock.json',
    '.gitignore',
    '.ember-cli',
    '.prettierignore',
    '.stylelintignore',
    '.template-lintrc.js',
    '.watchmanconfig',
    'process_metrics.csv',
    'scripts/',
    'tests/index.html'
  ];
  
  // Check if file should be excluded
  if (excludePatterns.some(pattern => filePath.includes(pattern))) {
    return false;
  }
  
  return allowedExtensions.includes(extension);
}

function getEmberFileType(filePath) {
  const filename = path.basename(filePath);
  const extension = getFileExtension(filePath);
  const dirname = path.dirname(filePath);
  
  // Ember-specific file type detection
  if (dirname.includes('app')) {
    if (dirname.includes('components')) {
      if (extension === '.hbs') return 'component-template';
      if (extension === '.ts' || extension === '.js') return 'component-class';
      return 'component';
    }
    if (dirname.includes('routes')) {
      return 'route';
    }
    if (dirname.includes('controllers')) {
      return 'controller';
    }
    if (dirname.includes('models')) {
      return 'model';
    }
    if (dirname.includes('services')) {
      return 'service';
    }
    if (dirname.includes('helpers')) {
      return 'helper';
    }
    if (dirname.includes('adapters')) {
      return 'adapter';
    }
    if (dirname.includes('serializers')) {
      return 'serializer';
    }
    if (dirname.includes('transforms')) {
      return 'transform';
    }
    if (dirname.includes('templates')) {
      return 'template';
    }
    if (filename === 'app.ts' || filename === 'app.js') return 'app';
    if (filename === 'router.ts' || filename === 'router.js') return 'router';
    if (filename === 'index.html') return 'app-template';
  }
  
  if (dirname.includes('config')) {
    return 'configuration';
  }
  
  if (dirname.includes('tests')) {
    if (dirname.includes('acceptance')) return 'acceptance-test';
    if (dirname.includes('integration')) return 'integration-test';
    if (dirname.includes('unit')) return 'unit-test';
    return 'test';
  }
  
  if (dirname.includes('types')) {
    return 'types';
  }
  
  if (extension === '.hbs') return 'handlebars-template';
  if (extension === '.ts') return 'typescript';
  if (extension === '.js') return 'javascript';
  if (extension === '.css') return 'styles';
  if (extension === '.json') return 'configuration';
  if (extension === '.html') return 'html-template';
  
  return 'other';
}

function scanDirectory(dirPath) {
  const results = [];
  
  function scan(currentPath) {
    try {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scan(fullPath);
        } else if (shouldAnalyzeFile(fullPath)) {
          const analysis = analyzeFile(fullPath);
          if (analysis) {
            analysis.type = getEmberFileType(fullPath);
            analysis.relativePath = path.relative(dirPath, fullPath);
            results.push(analysis);
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${currentPath}:`, error.message);
    }
  }
  
  scan(dirPath);
  return results;
}

function generateReport(files, projectPath) {
  const totalStats = {
    files: files.length,
    total: 0,
    source: 0,
    comments: 0,
    empty: 0
  };
  
  // Calculate totals
  files.forEach(file => {
    totalStats.total += file.total;
    totalStats.source += file.source;
    totalStats.comments += file.comments;
    totalStats.empty += file.empty;
  });
  
  // Group by type
  const byType = {};
  files.forEach(file => {
    if (!byType[file.type]) {
      byType[file.type] = { files: 0, total: 0, source: 0, comments: 0, empty: 0 };
    }
    byType[file.type].files++;
    byType[file.type].total += file.total;
    byType[file.type].source += file.source;
    byType[file.type].comments += file.comments;
    byType[file.type].empty += file.empty;
  });
  
  // Group by extension
  const byExtension = {};
  files.forEach(file => {
    if (!byExtension[file.extension]) {
      byExtension[file.extension] = { files: 0, total: 0, source: 0, comments: 0, empty: 0 };
    }
    byExtension[file.extension].files++;
    byExtension[file.extension].total += file.total;
    byExtension[file.extension].source += file.source;
    byExtension[file.extension].comments += file.comments;
    byExtension[file.extension].empty += file.empty;
  });

  // Find large files (potential refactoring candidates)
  const largeFiles = files
    .filter(f => f.total > 50) // Lower threshold for Ember
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const commentRatio = totalStats.total > 0 ? (totalStats.comments / totalStats.total * 100) : 0;
  const sourceRatio = totalStats.total > 0 ? (totalStats.source / totalStats.total * 100) : 0;
  const emptyRatio = totalStats.total > 0 ? (totalStats.empty / totalStats.total * 100) : 0;

  const report = `# Ember Book Collection - Code Analysis Report

*Generated on: ${new Date().toISOString().split('T')[0]}*

## 📊 Executive Summary

This Ember.js application manages book collections with a focus on Ember conventions and modern practices. The codebase demonstrates Ember CLI structure with TypeScript integration and follows the framework's "convention over configuration" philosophy.

### Key Metrics
- **Total Files**: ${totalStats.files}
- **Total Lines of Code**: ${totalStats.total.toLocaleString()}
- **Source Lines**: ${totalStats.source.toLocaleString()} (${sourceRatio.toFixed(1)}%)
- **Comment Lines**: ${totalStats.comments.toLocaleString()} (${commentRatio.toFixed(1)}%)
- **Empty Lines**: ${totalStats.empty.toLocaleString()} (${emptyRatio.toFixed(1)}%)
- **Comment Ratio**: ${commentRatio.toFixed(1)}%

## 🏗️ Architecture Overview

### Technology Stack
- **Framework**: Ember.js with Ember CLI
- **Language**: TypeScript + JavaScript
- **Templating**: Handlebars (HBS)
- **Styling**: CSS
- **Build Tool**: Ember CLI
- **Testing**: QUnit (configured)
- **Data Layer**: Ember Data

### Ember Convention Analysis

| Ember Layer | Files | Lines | Comments | Purpose |
|-------------|-------|-------|----------|---------|
${Object.entries(byType)
  .sort((a, b) => b[1].total - a[1].total)
  .map(([type, stats]) => 
    `| ${type} | ${stats.files} | ${stats.total.toLocaleString()} | ${stats.comments} | ${getTypeDescription(type)} |`
  ).join('\n')}

## 🧩 Ember Architecture Analysis

### File Type Distribution

| Extension | Files | Lines | Comments | Average Lines/File |
|-----------|-------|-------|----------|-------------------|
${Object.entries(byExtension)
  .sort((a, b) => b[1].total - a[1].total)
  .map(([ext, stats]) => 
    `| ${ext} | ${stats.files} | ${stats.total.toLocaleString()} | ${stats.comments} | ${Math.round(stats.total / stats.files)} |`
  ).join('\n')}

## 📋 File Complexity Analysis

### Notable Files (Ember Perspective)

${largeFiles.map((file, index) => {
  const complexity = getEmberComplexityLevel(file.total, file.type);
  const icon = complexity === 'High' ? '🔴' : complexity === 'Medium' ? '🟡' : '🟢';
  return `#### ${icon} ${complexity} Complexity (${file.total} lines)
${index + 1}. **${path.basename(file.path)}** (${file.total} lines)
   - **Type**: ${file.type}
   - **Path**: \`${file.relativePath}\`
   - **Recommendation**: ${getEmberRecommendation(file.type, file.total)}`;
}).join('\n\n')}

## 📈 Code Quality Metrics

### Documentation Coverage
- **Overall Comment Ratio**: ${commentRatio.toFixed(1)}% ${commentRatio >= 10 ? '✅ Good' : commentRatio >= 5 ? '⚠️ Acceptable' : '❌ Needs Improvement'}
- **Components**: ${getCommentRatioForType(byType, 'component-class').toFixed(1)}%
- **Routes**: ${getCommentRatioForType(byType, 'route').toFixed(1)}%
- **Models**: ${getCommentRatioForType(byType, 'model').toFixed(1)}%

### Ember-Specific Metrics
- **Template to Logic Ratio**: ${getTemplateLogicRatio(byExtension)}
- **Component Architecture**: ${getComponentArchitecture(byType)}
- **TypeScript Adoption**: ${((byExtension['.ts']?.files || 0) / totalStats.files * 100).toFixed(1)}%
- **Convention Adherence**: ${getConventionAdherence(byType)}

## 🎯 Recommendations

### High Priority
1. **Ember Convention Adherence**
${getEmberSpecificRecommendations(byType, largeFiles).slice(0, 3).join('\n')}

2. **Documentation Improvement**
   - Current comment ratio: ${commentRatio.toFixed(1)}% (target: 10-15%)
   - Add JSDoc comments to components and services
   - Document complex route behaviors and model relationships

3. **Code Organization**
   - Follow Ember's pod structure for better organization
   - Extract shared logic into services or utilities
   - Implement consistent naming conventions

### Medium Priority
4. **Ember Best Practices**
   - Use Ember Octane patterns consistently
   - Implement proper data down, actions up (DDAU)
   - Consider using Glimmer components where appropriate

5. **Testing Strategy**
   - Current test coverage: ${getTestCoverage(byType)}
   - Add integration tests for components
   - Implement acceptance tests for user flows

### Low Priority
6. **Performance Optimization**
   - Consider lazy loading for large routes
   - Optimize template rendering with tracked properties
   - Implement efficient data fetching patterns

## 🔍 Technical Debt Analysis

### Current State
${getEmberTechnicalDebtAssessment(totalStats, largeFiles, commentRatio, byType)}

### Ember-Specific Patterns
- **Route Architecture**: ${getRouteArchitectureStatus(byType)}
- **Component Design**: ${getComponentDesignStatus(byType)}
- **Data Layer**: ${getDataLayerStatus(byType)}

## 📊 Comparison with Ember Best Practices

| Metric | Current | Recommended | Status |
|--------|---------|-------------|--------|
| File Organization | ${getFileOrganizationScore(byType)} | Pod structure | ${getFileOrganizationScore(byType) === 'Convention-based' ? '✅' : '⚠️'} |
| Comment Ratio | ${commentRatio.toFixed(1)}% | 10-15% | ${commentRatio >= 10 ? '✅' : commentRatio >= 5 ? '⚠️' : '❌'} |
| TypeScript Usage | ${((byExtension['.ts']?.files || 0) / totalStats.files * 100).toFixed(1)}% | >80% | ${((byExtension['.ts']?.files || 0) / totalStats.files) > 0.8 ? '✅' : '⚠️'} |
| Template Pattern | Handlebars | Handlebars | ✅ |

## 🚀 Next Steps

1. **Immediate (This Sprint)**
   - Add component documentation
   - Standardize naming conventions

2. **Short Term (Next 2 Sprints)**
   - Implement comprehensive testing
   - Extract shared logic into services

3. **Long Term (Future Releases)**
   - Consider Ember Octane migration if needed
   - Advanced Ember patterns
   - Performance optimization

---

*This analysis was generated using automated code analysis tools. Regular updates recommended as the codebase evolves.*

## 📁 Detailed File Analysis

### All Analyzed Files
${files.map(file => 
  `- \`${file.relativePath}\` (${file.type}) - ${file.total} lines (${file.source} source, ${file.comments} comments)`
).join('\n')}
`;

  return report;
}

function getTypeDescription(type) {
  const descriptions = {
    'component-template': 'Handlebars component templates',
    'component-class': 'Component backing classes',
    'component': 'Ember components',
    'route': 'Route handlers and logic',
    'controller': 'Controller classes',
    'model': 'Data models and relationships',
    'service': 'Singleton services',
    'helper': 'Template helpers',
    'adapter': 'Data adapters',
    'serializer': 'Data serializers',
    'transform': 'Data transforms',
    'template': 'Route templates',
    'app': 'Application entry point',
    'router': 'Application router',
    'app-template': 'Main application template',
    'configuration': 'Configuration files',
    'acceptance-test': 'End-to-end tests',
    'integration-test': 'Integration tests',
    'unit-test': 'Unit tests',
    'test': 'Test files',
    'types': 'TypeScript definitions',
    'handlebars-template': 'Handlebars templates',
    'typescript': 'TypeScript files',
    'javascript': 'JavaScript files',
    'styles': 'CSS styling files',
    'html-template': 'HTML templates'
  };
  return descriptions[type] || 'Other files';
}

function getEmberComplexityLevel(lines, type) {
  // Ember-specific complexity thresholds
  const thresholds = {
    'component-class': { high: 150, medium: 80 },
    'component-template': { high: 100, medium: 50 },
    'route': { high: 100, medium: 50 },
    'controller': { high: 100, medium: 50 },
    'model': { high: 80, medium: 40 },
    'service': { high: 150, medium: 80 },
    'default': { high: 100, medium: 50 }
  };
  
  const threshold = thresholds[type] || thresholds.default;
  
  if (lines > threshold.high) return 'High';
  if (lines > threshold.medium) return 'Medium';
  return 'Low';
}

function getEmberRecommendation(type, lines) {
  const recommendations = {
    'component-class': 'Consider extracting computed properties or breaking into smaller components',
    'component-template': 'Break template into smaller components or use partials',
    'route': 'Extract logic into services or split route responsibilities',
    'controller': 'Move logic to routes or extract into services',
    'service': 'Split into multiple focused services',
    'model': 'Review relationships and computed properties'
  };
  
  return recommendations[type] || 'Consider refactoring for better maintainability';
}

function getCommentRatioForType(byType, type) {
  const typeStats = byType[type];
  if (!typeStats || typeStats.total === 0) return 0;
  return (typeStats.comments / typeStats.total) * 100;
}

function getTemplateLogicRatio(byExtension) {
  const templates = byExtension['.hbs']?.total || 0;
  const logic = (byExtension['.ts']?.total || 0) + (byExtension['.js']?.total || 0);
  if (logic === 0) return 'N/A';
  return `${(templates / logic).toFixed(2)}:1 (template:logic)`;
}

function getComponentArchitecture(byType) {
  const componentClasses = byType['component-class']?.files || 0;
  const componentTemplates = byType['component-template']?.files || 0;
  
  if (componentClasses === componentTemplates) {
    return '✅ Balanced component architecture';
  } else if (componentTemplates > componentClasses) {
    return '⚠️ Template-heavy components (consider backing classes)';
  } else {
    return '⚠️ Logic-heavy components (consider template extraction)';
  }
}

function getConventionAdherence(byType) {
  const hasRoutes = byType['route']?.files > 0;
  const hasControllers = byType['controller']?.files > 0;
  const hasModels = byType['model']?.files > 0;
  const hasTemplates = byType['template']?.files > 0;
  
  const score = [hasRoutes, hasControllers, hasModels, hasTemplates].filter(Boolean).length;
  
  if (score >= 3) return '✅ Good convention adherence';
  if (score >= 2) return '⚠️ Partial convention adherence';
  return '❌ Poor convention adherence';
}

function getEmberSpecificRecommendations(byType, largeFiles) {
  const recommendations = [];
  
  if (largeFiles.some(f => f.type === 'component-class')) {
    recommendations.push('   - Break large components into smaller, focused components');
  }
  
  if (largeFiles.some(f => f.type === 'route')) {
    recommendations.push('   - Extract route logic into services for reusability');
  }
  
  if (largeFiles.some(f => f.type === 'controller')) {
    recommendations.push('   - Move controller logic to routes or components (Octane pattern)');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('   - Continue following Ember conventions');
  }
  
  return recommendations;
}

function getTestCoverage(byType) {
  const testFiles = (byType['acceptance-test']?.files || 0) + 
                   (byType['integration-test']?.files || 0) + 
                   (byType['unit-test']?.files || 0) + 
                   (byType['test']?.files || 0);
  
  if (testFiles === 0) return '❌ No tests found';
  if (testFiles < 5) return '⚠️ Minimal test coverage';
  return '✅ Good test coverage';
}

function getEmberTechnicalDebtAssessment(totalStats, largeFiles, commentRatio, byType) {
  const largeFileCount = largeFiles.length;
  const hasProperStructure = byType['route'] && byType['template'];
  
  let assessment = '**Ember Debt Assessment**: ';
  
  if (largeFileCount > 3 && commentRatio < 5 && !hasProperStructure) {
    assessment += 'High debt - Large files, poor documentation, and convention violations';
  } else if (largeFileCount > 2 || commentRatio < 8 || !hasProperStructure) {
    assessment += 'Medium debt - Some issues with conventions or documentation';
  } else {
    assessment += 'Low debt - Well-structured Ember application';
  }
  
  return assessment;
}

function getRouteArchitectureStatus(byType) {
  const routes = byType['route']?.files || 0;
  const controllers = byType['controller']?.files || 0;
  
  if (routes > controllers * 2) {
    return '✅ Modern Ember routing (route-centric)';
  } else if (controllers > routes) {
    return '⚠️ Legacy pattern (controller-heavy)';
  }
  return '✅ Balanced routing architecture';
}

function getComponentDesignStatus(byType) {
  const componentClasses = byType['component-class']?.files || 0;
  const componentTemplates = byType['component-template']?.files || 0;
  
  if (componentClasses > 0 && componentTemplates > 0) {
    return '✅ Component-driven architecture';
  } else if (componentTemplates > 0) {
    return '⚠️ Template-only components';
  }
  return '❌ Limited component usage';
}

function getDataLayerStatus(byType) {
  const hasModels = byType['model']?.files > 0;
  const hasAdapters = byType['adapter']?.files > 0;
  const hasSerializers = byType['serializer']?.files > 0;
  
  if (hasModels && hasAdapters && hasSerializers) {
    return '✅ Complete Ember Data setup';
  } else if (hasModels) {
    return '⚠️ Basic data layer';
  }
  return '❌ Minimal data layer';
}

function getFileOrganizationScore(byType) {
  const hasProperStructure = byType['route'] && byType['template'] && byType['component-class'];
  return hasProperStructure ? 'Convention-based' : 'Needs-improvement';
}

// Main execution
const projectPath = process.cwd();
console.log(`🔍 Analyzing Ember.js project: ${projectPath}`);
console.log('📊 Scanning files...');

const files = scanDirectory(projectPath);
console.log(`✅ Found ${files.length} files to analyze`);

console.log('📈 Generating report...');
const report = generateReport(files, projectPath);

const outputFile = 'EMBER_CODE_ANALYSIS_REPORT.md';
fs.writeFileSync(outputFile, report);

console.log(`✅ Report saved to: ${outputFile}`);
console.log(`📋 Summary: ${files.length} files, ${files.reduce((sum, f) => sum + f.total, 0)} total lines`);
