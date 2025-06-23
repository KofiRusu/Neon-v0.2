#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🤖 Starting Autonomous Testing Agent...');

const testResults = {
  timestamp: new Date().toISOString(),
  results: {
    unitTests: { passed: false, coverage: 0, errors: [] },
    e2eTests: { passed: false, errors: [] },
    typeChecks: { passed: false, errors: [] },
    linting: { passed: false, errors: [] },
    buildValidation: { passed: false, errors: [] },
    security: { passed: false, vulnerabilities: [] }
  },
  recommendations: [],
  criticalIssues: []
};

function runCommand(command, description) {
  console.log(`🔍 ${description}...`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} completed successfully`);
    return { success: true, output };
  } catch (error) {
    console.log(`❌ ${description} failed:`, error.message);
    return { success: false, error: error.message, output: error.stdout || error.stderr };
  }
}

// Run unit tests with coverage
const unitTestResult = runCommand('npm run test:coverage', 'Unit Tests with Coverage');
testResults.results.unitTests.passed = unitTestResult.success;
if (!unitTestResult.success) {
  testResults.results.unitTests.errors.push(unitTestResult.error);
  testResults.criticalIssues.push('Unit tests failing');
}

// Run type checks
const typeCheckResult = runCommand('npm run type-check', 'TypeScript Type Checking');
testResults.results.typeChecks.passed = typeCheckResult.success;
if (!typeCheckResult.success) {
  testResults.results.typeChecks.errors.push(typeCheckResult.error);
  testResults.criticalIssues.push('TypeScript errors detected');
}

// Run linting
const lintResult = runCommand('npm run lint', 'ESLint Code Quality Check');
testResults.results.linting.passed = lintResult.success;
if (!lintResult.success) {
  testResults.results.linting.errors.push(lintResult.error);
  testResults.recommendations.push('Fix linting issues to improve code quality');
}

// Run build validation
const buildResult = runCommand('npm run build:apps', 'Application Build Validation');
testResults.results.buildValidation.passed = buildResult.success;
if (!buildResult.success) {
  testResults.results.buildValidation.errors.push(buildResult.error);
  testResults.criticalIssues.push('Build process failing');
}

// Run security audit
const securityResult = runCommand('npm audit --audit-level=moderate --json', 'Security Vulnerability Scan');
testResults.results.security.passed = securityResult.success;
if (!securityResult.success && securityResult.output) {
  try {
    const auditData = JSON.parse(securityResult.output);
    if (auditData.vulnerabilities) {
      testResults.results.security.vulnerabilities = Object.keys(auditData.vulnerabilities);
      testResults.recommendations.push('Address security vulnerabilities in dependencies');
    }
  } catch (e) {
    console.log('Could not parse security audit output');
  }
}

// Generate recommendations based on results
if (testResults.results.unitTests.coverage < 80) {
  testResults.recommendations.push('Improve test coverage to at least 80%');
}

if (testResults.criticalIssues.length === 0) {
  testResults.recommendations.push('All core systems functioning properly - consider performance optimizations');
}

// Generate markdown report
const reportContent = `# Autonomous Testing Report

Generated: ${testResults.timestamp}

## Executive Summary

${testResults.criticalIssues.length === 0 ? '✅ **All systems operational**' : `❌ **${testResults.criticalIssues.length} critical issues detected**`}

## Test Results

### Unit Tests & Coverage
- Status: ${testResults.results.unitTests.passed ? '✅ PASSED' : '❌ FAILED'}
- Coverage: ${testResults.results.unitTests.coverage}%
${testResults.results.unitTests.errors.length > 0 ? `- Errors: ${testResults.results.unitTests.errors.join(', ')}` : ''}

### Type Safety
- Status: ${testResults.results.typeChecks.passed ? '✅ PASSED' : '❌ FAILED'}
${testResults.results.typeChecks.errors.length > 0 ? `- Errors: ${testResults.results.typeChecks.errors.join(', ')}` : ''}

### Code Quality (Linting)
- Status: ${testResults.results.linting.passed ? '✅ PASSED' : '❌ FAILED'}
${testResults.results.linting.errors.length > 0 ? `- Issues: ${testResults.results.linting.errors.join(', ')}` : ''}

### Build Validation
- Status: ${testResults.results.buildValidation.passed ? '✅ PASSED' : '❌ FAILED'}
${testResults.results.buildValidation.errors.length > 0 ? `- Errors: ${testResults.results.buildValidation.errors.join(', ')}` : ''}

### Security Audit
- Status: ${testResults.results.security.passed ? '✅ PASSED' : '❌ VULNERABILITIES FOUND'}
${testResults.results.security.vulnerabilities.length > 0 ? `- Vulnerabilities: ${testResults.results.security.vulnerabilities.join(', ')}` : ''}

## Critical Issues

${testResults.criticalIssues.length === 0 ? 'None detected.' : testResults.criticalIssues.map(issue => `- ${issue}`).join('\n')}

## Recommendations

${testResults.recommendations.map(rec => `- ${rec}`).join('\n')}

## Next Steps

${testResults.criticalIssues.length > 0 ? 
  '1. Address critical issues immediately\n2. Run autonomous testing again\n3. Proceed with deployment only after all issues resolved' :
  '1. System ready for deployment\n2. Consider implementing performance optimizations\n3. Schedule next autonomous testing cycle'
}
`;

// Write report to file
fs.writeFileSync('autonomous-testing-report.md', reportContent);

console.log('\n📊 Autonomous Testing Complete!');
console.log(`📝 Report generated: autonomous-testing-report.md`);
console.log(`🎯 Critical Issues: ${testResults.criticalIssues.length}`);
console.log(`💡 Recommendations: ${testResults.recommendations.length}`);

// Exit with appropriate code
process.exit(testResults.criticalIssues.length > 0 ? 1 : 0);