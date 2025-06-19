export { default as prisma } from './client';
export * from '@prisma/client';

// Custom types for the data model
export interface AIEventLogData {
  agent: string;
  event: string;
  metadata?: Record<string, unknown>;
  success?: boolean;
  error?: string;
}

export interface QualityScoreData {
  agent: string;
  outputId?: string;
  relevanceScore: number;
  clarityScore: number;
  grammarScore: number;
  engagementScore: number;
  overallScore: number;
  hallucinationDetected?: boolean;
  metadata?: Record<string, unknown>;
}

export interface AgentPerformanceData {
  agent: string;
  totalOutputs: number;
  averageScore: number;
  hallucinationRate: number;
  lastEvaluated?: Date;
}