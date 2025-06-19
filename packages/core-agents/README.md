# Core Agents Package

This package contains AI agents for the Neon v0.2 system, including the AuditAgent for system-wide AI output evaluation.

## AuditAgent

The AuditAgent performs autonomous quality audits on all other agents' outputs using OpenAI's GPT-4 model.

### Features

- **Content Evaluation**: Rates output on relevance, clarity, grammar, and engagement
- **Hallucination Detection**: Identifies potentially false or unverifiable claims
- **Performance Logging**: Maintains historical quality scores per agent
- **System Statistics**: Provides system-wide audit analytics

### Usage

```typescript
import { AuditAgent } from '@neon/core-agents';

const auditAgent = new AuditAgent(process.env.OPENAI_API_KEY);

// Evaluate content quality
const qualityScore = await auditAgent.evaluateContentOutput('Your content here');
console.log(`Overall score: ${qualityScore.overall}`);

// Check for hallucinations
const isHallucination = await auditAgent.detectHallucination('Content to check');
console.log(`Hallucination detected: ${isHallucination}`);

// Log agent performance
await auditAgent.logAgentPerformance('AgentName', qualityScore.overall, {
  relevanceScore: qualityScore.relevance,
  clarityScore: qualityScore.clarity,
  grammarScore: qualityScore.grammar,
  engagementScore: qualityScore.engagement,
  hallucinationDetected: isHallucination
});

// Get system statistics
const stats = await auditAgent.getSystemAuditStats();
console.log('System audit stats:', stats);
```

### Evaluation Criteria

The AuditAgent evaluates content based on four weighted criteria:

1. **Relevance (30%)**: How relevant and on-topic the content is
2. **Clarity (25%)**: How clear, understandable, and well-structured the content is
3. **Grammar (20%)**: Grammatical correctness and language quality
4. **Engagement (25%)**: How engaging and compelling the content is

### Database Models

The AuditAgent uses the following database models:

- `QualityScore`: Stores individual quality evaluations
- `AgentPerformance`: Tracks aggregated performance metrics per agent
- `AIEventLog`: Logs all audit events and errors

### Environment Variables

- `OPENAI_API_KEY`: Required for OpenAI API access
- `DATABASE_URL`: PostgreSQL connection string (managed by Prisma)

### Testing

Run tests with:

```bash
npm test
```

The test suite includes comprehensive unit tests and integration tests for all AuditAgent functionality.