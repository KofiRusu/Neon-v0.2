/**
 * Core Agents Package
 * Exports all AI agents for the Neon v0.2 system
 */

export { AuditAgent } from './auditAgent';

// Re-export types for convenience
export type {
  QualityScore,
  HallucinationCheck,
  EvaluationCriteria,
  AgentPerformanceMetrics
} from '@neon/types';