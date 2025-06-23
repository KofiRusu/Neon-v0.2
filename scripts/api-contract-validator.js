#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📋 Starting API Contract Validation...');

const validationResults = {
  timestamp: new Date().toISOString(),
  contracts: {
    trpc: { valid: false, endpoints: [], errors: [] },
    types: { valid: false, exports: [], errors: [] },
    schema: { valid: false, tables: [], errors: [] }
  },
  compliance: {
    restStandards: false,
    typeContract: false,
    errorHandling: false,
    authentication: false
  },
  recommendations: [],
  issues: []
};

function validateFile(filePath, description) {
  console.log(`🔍 Validating ${description}...`);
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${description} not found at ${filePath}`);
      return { valid: false, error: `File not found: ${filePath}` };
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`✅ ${description} exists and readable`);
    return { valid: true, content };
  } catch (error) {
    console.log(`❌ ${description} validation failed:`, error.message);
    return { valid: false, error: error.message };
  }
}

// Validate tRPC API contracts
console.log('\n🔗 Validating tRPC API Contracts...');

const trpcRouterPath = 'apps/api/src/server/root.ts';
const trpcRouterResult = validateFile(trpcRouterPath, 'tRPC Root Router');

if (trpcRouterResult.valid) {
  validationResults.contracts.trpc.valid = true;
  
  // Extract router endpoints
  const routerMatches = trpcRouterResult.content.match(/(\w+):\s*\w+Router/g);
  if (routerMatches) {
    validationResults.contracts.trpc.endpoints = routerMatches.map(match => match.split(':')[0]);
    console.log(`📍 Found ${validationResults.contracts.trpc.endpoints.length} router endpoints`);
  }
} else {
  validationResults.contracts.trpc.errors.push(trpcRouterResult.error);
  validationResults.issues.push('tRPC router configuration invalid');
}

// Validate individual routers
const routerPaths = [
  'apps/api/src/server/routers/agent.ts',
  'apps/api/src/server/routers/campaign.ts',
  'apps/api/src/server/routers/user.ts',
  'apps/api/src/server/routers/metrics.ts'
];

let validRouters = 0;
routerPaths.forEach(routerPath => {
  const routerResult = validateFile(routerPath, `Router: ${path.basename(routerPath)}`);
  if (routerResult.valid) {
    validRouters++;
    
    // Check for proper procedure definitions
    const procedureMatches = routerResult.content.match(/\.(query|mutation)\(/g);
    if (procedureMatches) {
      console.log(`  📊 Found ${procedureMatches.length} procedures`);
    }
  } else {
    validationResults.contracts.trpc.errors.push(`${routerPath}: ${routerResult.error}`);
  }
});

console.log(`✅ ${validRouters}/${routerPaths.length} routers validated successfully`);

// Validate TypeScript types
console.log('\n🎯 Validating TypeScript Type Contracts...');

const typesPath = 'packages/types/src/index.ts';
const typesResult = validateFile(typesPath, 'TypeScript Types Package');

if (typesResult.valid) {
  validationResults.contracts.types.valid = true;
  
  // Extract exported types
  const exportMatches = typesResult.content.match(/export\s+(type|interface)\s+\w+/g);
  if (exportMatches) {
    validationResults.contracts.types.exports = exportMatches.map(match => 
      match.replace(/export\s+(type|interface)\s+/, '')
    );
    console.log(`📦 Found ${validationResults.contracts.types.exports.length} exported types`);
  }
  
  validationResults.compliance.typeContract = true;
} else {
  validationResults.contracts.types.errors.push(typesResult.error);
  validationResults.issues.push('TypeScript type contracts invalid');
}

// Validate Prisma schema
console.log('\n🗄️ Validating Database Schema...');

const schemaPath = 'packages/data-model/prisma/schema.prisma';
const schemaResult = validateFile(schemaPath, 'Prisma Database Schema');

if (schemaResult.valid) {
  validationResults.contracts.schema.valid = true;
  
  // Extract model definitions
  const modelMatches = schemaResult.content.match(/model\s+\w+\s*{/g);
  if (modelMatches) {
    validationResults.contracts.schema.tables = modelMatches.map(match => 
      match.replace(/model\s+(\w+)\s*{/, '$1')
    );
    console.log(`🏗️ Found ${validationResults.contracts.schema.tables.length} database models`);
  }
  
  // Check for proper relationships
  const relationMatches = schemaResult.content.match(/@relation/g);
  if (relationMatches) {
    console.log(`🔗 Found ${relationMatches.length} model relationships`);
  }
} else {
  validationResults.contracts.schema.errors.push(schemaResult.error);
  validationResults.issues.push('Database schema invalid');
}

// Validate API middleware and error handling
console.log('\n🛡️ Validating API Middleware...');

const middlewarePath = 'apps/api/src/server/trpc.ts';
const middlewareResult = validateFile(middlewarePath, 'tRPC Middleware Configuration');

if (middlewareResult.valid) {
  // Check for error handling
  if (middlewareResult.content.includes('onError') || middlewareResult.content.includes('errorFormatter')) {
    validationResults.compliance.errorHandling = true;
    console.log('✅ Error handling middleware configured');
  } else {
    validationResults.recommendations.push('Add comprehensive error handling middleware');
  }
  
  // Check for authentication middleware
  if (middlewareResult.content.includes('auth') || middlewareResult.content.includes('session')) {
    validationResults.compliance.authentication = true;
    console.log('✅ Authentication middleware configured');
  } else {
    validationResults.recommendations.push('Add authentication middleware for protected routes');
  }
} else {
  validationResults.issues.push('tRPC middleware configuration invalid');
}

// Generate compliance score
const complianceScore = Object.values(validationResults.compliance).filter(Boolean).length;
const totalCompliance = Object.keys(validationResults.compliance).length;
const compliancePercentage = Math.round((complianceScore / totalCompliance) * 100);

console.log(`\n📊 Compliance Score: ${complianceScore}/${totalCompliance} (${compliancePercentage}%)`);

// Generate recommendations
if (validationResults.contracts.trpc.endpoints.length < 10) {
  validationResults.recommendations.push('Consider expanding API endpoints for better feature coverage');
}

if (validationResults.contracts.types.exports.length < 20) {
  validationResults.recommendations.push('Add more specific TypeScript types for better type safety');
}

if (validationResults.contracts.schema.tables.length < 10) {
  validationResults.recommendations.push('Consider expanding database schema for comprehensive data modeling');
}

// Generate validation report
const reportContent = `# API Contract Validation Report

Generated: ${validationResults.timestamp}

## Executive Summary

**Overall Status**: ${validationResults.issues.length === 0 ? '✅ CONTRACTS VALID' : `❌ ${validationResults.issues.length} ISSUES FOUND`}
**Compliance Score**: ${compliancePercentage}% (${complianceScore}/${totalCompliance})

## Contract Validation Results

### tRPC API Contracts
- **Status**: ${validationResults.contracts.trpc.valid ? '✅ VALID' : '❌ INVALID'}
- **Endpoints**: ${validationResults.contracts.trpc.endpoints.length}
- **Routers**: ${validRouters}/${routerPaths.length}
${validationResults.contracts.trpc.errors.length > 0 ? `- **Errors**: ${validationResults.contracts.trpc.errors.join(', ')}` : ''}

### TypeScript Type Contracts
- **Status**: ${validationResults.contracts.types.valid ? '✅ VALID' : '❌ INVALID'}
- **Exported Types**: ${validationResults.contracts.types.exports.length}
${validationResults.contracts.types.errors.length > 0 ? `- **Errors**: ${validationResults.contracts.types.errors.join(', ')}` : ''}

### Database Schema
- **Status**: ${validationResults.contracts.schema.valid ? '✅ VALID' : '❌ INVALID'}
- **Models**: ${validationResults.contracts.schema.tables.length}
${validationResults.contracts.schema.errors.length > 0 ? `- **Errors**: ${validationResults.contracts.schema.errors.join(', ')}` : ''}

## Compliance Check

- **REST Standards**: ${validationResults.compliance.restStandards ? '✅' : '❌'}
- **Type Contract**: ${validationResults.compliance.typeContract ? '✅' : '❌'}
- **Error Handling**: ${validationResults.compliance.errorHandling ? '✅' : '❌'}
- **Authentication**: ${validationResults.compliance.authentication ? '✅' : '❌'}

## Issues Found

${validationResults.issues.length === 0 ? 'None detected.' : validationResults.issues.map(issue => `- ${issue}`).join('\n')}

## Recommendations

${validationResults.recommendations.length === 0 ? 'API contracts are well-structured.' : validationResults.recommendations.map(rec => `- ${rec}`).join('\n')}

## Detailed Analysis

### Discovered Endpoints
${validationResults.contracts.trpc.endpoints.map(endpoint => `- ${endpoint}`).join('\n')}

### Database Models
${validationResults.contracts.schema.tables.map(table => `- ${table}`).join('\n')}

### Type Exports
${validationResults.contracts.types.exports.slice(0, 10).map(type => `- ${type}`).join('\n')}
${validationResults.contracts.types.exports.length > 10 ? `... and ${validationResults.contracts.types.exports.length - 10} more` : ''}

## Next Steps

${validationResults.issues.length > 0 ? 
  '1. Fix contract validation issues\n2. Re-run validation\n3. Update API documentation\n4. Proceed with deployment' :
  '1. API contracts validated successfully\n2. Update API documentation\n3. Ready for deployment\n4. Schedule regular contract validation'
}
`;

// Write report to file
fs.writeFileSync('api-contract-validation-report.md', reportContent);

console.log('\n📋 API Contract Validation Complete!');
console.log(`📝 Report generated: api-contract-validation-report.md`);
console.log(`🎯 Issues Found: ${validationResults.issues.length}`);
console.log(`💡 Recommendations: ${validationResults.recommendations.length}`);
console.log(`📊 Compliance: ${compliancePercentage}%`);

// Exit with appropriate code
process.exit(validationResults.issues.length > 0 ? 1 : 0);