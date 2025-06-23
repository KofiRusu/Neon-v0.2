#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎯 Starting Fine-Tuning Master Agent...');

const fineTuningResults = {
  timestamp: new Date().toISOString(),
  analysis: {
    performance: { score: 0, bottlenecks: [], recommendations: [] },
    codeQuality: { score: 0, issues: [], improvements: [] },
    architecture: { score: 0, patterns: [], suggestions: [] },
    dependencies: { score: 0, outdated: [], vulnerabilities: [] }
  },
  optimizations: {
    immediate: [],
    shortTerm: [],
    longTerm: []
  },
  metrics: {
    buildTime: 0,
    bundleSize: 0,
    testCoverage: 0,
    typeErrors: 0
  },
  priority: {
    critical: [],
    high: [],
    medium: [],
    low: []
  }
};

function runAnalysis(command, description, timeout = 30000) {
  console.log(`🔍 ${description}...`);
  try {
    const startTime = Date.now();
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe', 
      timeout 
    });
    const duration = Date.now() - startTime;
    console.log(`✅ ${description} completed in ${duration}ms`);
    return { success: true, output, duration };
  } catch (error) {
    console.log(`⚠️ ${description} analysis issue:`, error.message);
    return { success: false, error: error.message, output: error.stdout || error.stderr };
  }
}

// Analyze build performance
console.log('\n⚡ Analyzing Build Performance...');

const buildAnalysis = runAnalysis('npm run build:apps', 'Build Performance Analysis');
if (buildAnalysis.success) {
  fineTuningResults.metrics.buildTime = buildAnalysis.duration;
  
  if (buildAnalysis.duration > 60000) { // >1 minute
    fineTuningResults.analysis.performance.bottlenecks.push('Slow build time detected');
    fineTuningResults.optimizations.immediate.push('Optimize build configuration for faster compilation');
    fineTuningResults.priority.high.push('BUILD_PERFORMANCE: Build time exceeds 1 minute');
  } else if (buildAnalysis.duration > 30000) { // >30 seconds
    fineTuningResults.optimizations.shortTerm.push('Consider implementing build caching');
    fineTuningResults.priority.medium.push('BUILD_OPTIMIZATION: Consider build improvements');
  }
} else {
  fineTuningResults.priority.critical.push('BUILD_FAILURE: Build process failing');
}

// Analyze code quality metrics
console.log('\n📊 Analyzing Code Quality...');

const lintAnalysis = runAnalysis('npm run lint', 'Code Quality Analysis');
if (lintAnalysis.success) {
  fineTuningResults.analysis.codeQuality.score = 85; // Base score for passing lint
  fineTuningResults.optimizations.longTerm.push('Maintain high code quality standards');
} else {
  const errorCount = (lintAnalysis.output.match(/error/gi) || []).length;
  const warningCount = (lintAnalysis.output.match(/warning/gi) || []).length;
  
  fineTuningResults.analysis.codeQuality.issues.push(`${errorCount} errors, ${warningCount} warnings`);
  
  if (errorCount > 0) {
    fineTuningResults.priority.high.push(`CODE_QUALITY: ${errorCount} linting errors`);
    fineTuningResults.optimizations.immediate.push('Fix all linting errors immediately');
  }
  
  if (warningCount > 10) {
    fineTuningResults.priority.medium.push(`CODE_QUALITY: ${warningCount} linting warnings`);
    fineTuningResults.optimizations.shortTerm.push('Address linting warnings to improve code quality');
  }
}

// Analyze TypeScript errors
console.log('\n🎯 Analyzing TypeScript Quality...');

const typeAnalysis = runAnalysis('npm run type-check', 'TypeScript Analysis');
if (typeAnalysis.success) {
  fineTuningResults.analysis.codeQuality.score += 10; // Bonus for type safety
  fineTuningResults.optimizations.longTerm.push('Excellent TypeScript implementation');
} else {
  const typeErrors = (typeAnalysis.output.match(/error TS\d+/g) || []).length;
  fineTuningResults.metrics.typeErrors = typeErrors;
  
  if (typeErrors > 0) {
    fineTuningResults.priority.critical.push(`TYPE_SAFETY: ${typeErrors} TypeScript errors`);
    fineTuningResults.optimizations.immediate.push('Fix all TypeScript errors for type safety');
  }
}

// Analyze test coverage
console.log('\n🧪 Analyzing Test Coverage...');

const testAnalysis = runAnalysis('npm run test:coverage', 'Test Coverage Analysis');
if (testAnalysis.success) {
  // Extract coverage percentage (simplified)
  const coverageMatch = testAnalysis.output.match(/(\d+(?:\.\d+)?)%/);
  if (coverageMatch) {
    const coverage = parseFloat(coverageMatch[1]);
    fineTuningResults.metrics.testCoverage = coverage;
    
    if (coverage < 70) {
      fineTuningResults.priority.high.push(`TEST_COVERAGE: Only ${coverage}% test coverage`);
      fineTuningResults.optimizations.immediate.push('Increase test coverage to at least 80%');
    } else if (coverage < 85) {
      fineTuningResults.priority.medium.push(`TEST_COVERAGE: ${coverage}% coverage - room for improvement`);
      fineTuningResults.optimizations.shortTerm.push('Aim for 90%+ test coverage');
    } else {
      fineTuningResults.optimizations.longTerm.push('Excellent test coverage maintained');
    }
  }
}

// Analyze dependencies
console.log('\n📦 Analyzing Dependencies...');

const auditAnalysis = runAnalysis('npm audit --json', 'Dependency Security Analysis');
if (auditAnalysis.success) {
  try {
    const auditData = JSON.parse(auditAnalysis.output);
    const vulnCount = auditData.metadata?.vulnerabilities?.total || 0;
    
    if (vulnCount > 0) {
      fineTuningResults.analysis.dependencies.vulnerabilities.push(`${vulnCount} security vulnerabilities`);
      fineTuningResults.priority.high.push(`SECURITY: ${vulnCount} dependency vulnerabilities`);
      fineTuningResults.optimizations.immediate.push('Update dependencies to fix security vulnerabilities');
    } else {
      fineTuningResults.analysis.dependencies.score = 90;
      fineTuningResults.optimizations.longTerm.push('Dependencies are secure and up-to-date');
    }
  } catch (e) {
    console.log('Could not parse audit results');
  }
}

// Analyze bundle size (if available)
console.log('\n📊 Analyzing Bundle Size...');

const bundleAnalyzer = ['apps/dashboard/.next', 'apps/api/dist'].some(dir => {
  if (fs.existsSync(dir)) {
    const stats = fs.statSync(dir);
    if (stats.isDirectory()) {
      const size = execSync(`du -sh ${dir}`, { encoding: 'utf8' }).split('\t')[0];
      console.log(`📦 ${dir}: ${size}`);
      
      // Extract size in MB (simplified)
      const sizeMatch = size.match(/(\d+(?:\.\d+)?)(M|K)/);
      if (sizeMatch) {
        const [, num, unit] = sizeMatch;
        const sizeInMB = unit === 'M' ? parseFloat(num) : parseFloat(num) / 1024;
        
        if (sizeInMB > 50) {
          fineTuningResults.priority.medium.push(`BUNDLE_SIZE: Large bundle size (${size})`);
          fineTuningResults.optimizations.shortTerm.push('Optimize bundle size through code splitting');
        }
      }
      return true;
    }
  }
  return false;
});

// Architecture analysis
console.log('\n🏗️ Analyzing Architecture Patterns...');

const architecturePatterns = {
  monorepo: fs.existsSync('package.json') && JSON.parse(fs.readFileSync('package.json')).workspaces,
  typeScript: fs.existsSync('tsconfig.json'),
  testing: fs.existsSync('jest.config.js'),
  linting: fs.existsSync('.eslintrc.json'),
  gitHooks: fs.existsSync('.husky'),
  docker: fs.existsSync('docker'),
  ci: fs.existsSync('.github/workflows')
};

const implementedPatterns = Object.values(architecturePatterns).filter(Boolean).length;
const totalPatterns = Object.keys(architecturePatterns).length;
const architectureScore = Math.round((implementedPatterns / totalPatterns) * 100);

fineTuningResults.analysis.architecture.score = architectureScore;
fineTuningResults.analysis.architecture.patterns = Object.entries(architecturePatterns)
  .filter(([, implemented]) => implemented)
  .map(([pattern]) => pattern);

if (architectureScore < 80) {
  fineTuningResults.priority.medium.push(`ARCHITECTURE: ${architectureScore}% of best practices implemented`);
  fineTuningResults.optimizations.shortTerm.push('Implement missing architecture best practices');
}

// Generate final recommendations
console.log('\n🎯 Generating Optimization Recommendations...');

// Calculate overall score
const scores = [
  fineTuningResults.analysis.performance.score,
  fineTuningResults.analysis.codeQuality.score,
  fineTuningResults.analysis.architecture.score,
  fineTuningResults.analysis.dependencies.score
].filter(score => score > 0);

const overallScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0;

// Priority-based recommendations
if (fineTuningResults.priority.critical.length === 0 && fineTuningResults.priority.high.length === 0) {
  fineTuningResults.optimizations.longTerm.push('System is stable - focus on performance optimizations');
}

if (fineTuningResults.metrics.buildTime > 0 && fineTuningResults.metrics.testCoverage > 80) {
  fineTuningResults.optimizations.shortTerm.push('Consider implementing advanced CI/CD optimizations');
}

// Generate comprehensive report
const reportContent = `# Fine-Tuning Master Report

Generated: ${fineTuningResults.timestamp}

## Executive Summary

**Overall System Health**: ${overallScore}%
**Critical Issues**: ${fineTuningResults.priority.critical.length}
**High Priority**: ${fineTuningResults.priority.high.length}
**Optimization Opportunities**: ${fineTuningResults.optimizations.immediate.length + fineTuningResults.optimizations.shortTerm.length}

## Performance Metrics

- **Build Time**: ${fineTuningResults.metrics.buildTime}ms
- **Test Coverage**: ${fineTuningResults.metrics.testCoverage}%
- **TypeScript Errors**: ${fineTuningResults.metrics.typeErrors}
- **Architecture Score**: ${fineTuningResults.analysis.architecture.score}%

## Analysis Results

### Performance Analysis
- **Score**: ${fineTuningResults.analysis.performance.score}%
- **Bottlenecks**: ${fineTuningResults.analysis.performance.bottlenecks.length > 0 ? fineTuningResults.analysis.performance.bottlenecks.join(', ') : 'None detected'}

### Code Quality Analysis
- **Score**: ${fineTuningResults.analysis.codeQuality.score}%
- **Issues**: ${fineTuningResults.analysis.codeQuality.issues.length > 0 ? fineTuningResults.analysis.codeQuality.issues.join(', ') : 'None detected'}

### Architecture Analysis
- **Score**: ${fineTuningResults.analysis.architecture.score}%
- **Implemented Patterns**: ${fineTuningResults.analysis.architecture.patterns.join(', ')}

### Dependencies Analysis
- **Score**: ${fineTuningResults.analysis.dependencies.score}%
- **Vulnerabilities**: ${fineTuningResults.analysis.dependencies.vulnerabilities.length > 0 ? fineTuningResults.analysis.dependencies.vulnerabilities.join(', ') : 'None detected'}

## Priority Actions

### Critical (Fix Immediately)
${fineTuningResults.priority.critical.length > 0 ? fineTuningResults.priority.critical.map(item => `- ${item}`).join('\n') : '- None'}

### High Priority (Fix Within 24 Hours)
${fineTuningResults.priority.high.length > 0 ? fineTuningResults.priority.high.map(item => `- ${item}`).join('\n') : '- None'}

### Medium Priority (Fix Within Week)
${fineTuningResults.priority.medium.length > 0 ? fineTuningResults.priority.medium.map(item => `- ${item}`).join('\n') : '- None'}

### Low Priority (Long-term)
${fineTuningResults.priority.low.length > 0 ? fineTuningResults.priority.low.map(item => `- ${item}`).join('\n') : '- None'}

## Optimization Roadmap

### Immediate Actions (Today)
${fineTuningResults.optimizations.immediate.length > 0 ? fineTuningResults.optimizations.immediate.map(item => `- ${item}`).join('\n') : '- System operating optimally'}

### Short-term Improvements (This Week)
${fineTuningResults.optimizations.shortTerm.length > 0 ? fineTuningResults.optimizations.shortTerm.map(item => `- ${item}`).join('\n') : '- Continue monitoring performance'}

### Long-term Strategy (This Month)
${fineTuningResults.optimizations.longTerm.length > 0 ? fineTuningResults.optimizations.longTerm.map(item => `- ${item}`).join('\n') : '- Plan next optimization cycle'}

## Recommended Next Steps

${fineTuningResults.priority.critical.length > 0 ? 
  '1. **URGENT**: Address all critical issues immediately\n2. Fix high-priority items within 24 hours\n3. Re-run fine-tuning analysis\n4. Proceed with deployment only after critical issues resolved' :
  fineTuningResults.priority.high.length > 0 ?
    '1. Address high-priority issues within 24 hours\n2. Implement immediate optimizations\n3. Schedule medium-priority improvements\n4. Monitor performance metrics' :
    '1. System performing well - implement short-term improvements\n2. Plan long-term optimization strategy\n3. Schedule regular fine-tuning sessions\n4. Ready for production deployment'
}

## Performance Benchmarks

- Build time target: <30s (Current: ${fineTuningResults.metrics.buildTime}ms)
- Test coverage target: >85% (Current: ${fineTuningResults.metrics.testCoverage}%)
- Type safety target: 0 errors (Current: ${fineTuningResults.metrics.typeErrors})
- Architecture compliance: >90% (Current: ${fineTuningResults.analysis.architecture.score}%)

---

*This report was generated by the Fine-Tuning Master Agent. Re-run regularly for continuous optimization.*
`;

// Write report to file
fs.writeFileSync('FINE_TUNING_MASTER_REPORT.md', reportContent);

console.log('\n🎯 Fine-Tuning Analysis Complete!');
console.log(`📝 Report generated: FINE_TUNING_MASTER_REPORT.md`);
console.log(`📊 Overall Score: ${overallScore}%`);
console.log(`🚨 Critical Issues: ${fineTuningResults.priority.critical.length}`);
console.log(`⚠️ High Priority: ${fineTuningResults.priority.high.length}`);
console.log(`💡 Optimizations: ${fineTuningResults.optimizations.immediate.length + fineTuningResults.optimizations.shortTerm.length}`);

// Exit with appropriate code
process.exit(fineTuningResults.priority.critical.length > 0 ? 1 : 0);