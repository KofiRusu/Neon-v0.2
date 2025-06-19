import type { Logger } from '@/types';

// Base agent interface
export interface Agent {
  readonly name: string;
  readonly version: string;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}

// Agent context for dependency injection
export interface AgentContext {
  logger: Logger;
  config: AgentConfig;
}

// Configuration for agents
export interface AgentConfig {
  environment: 'development' | 'production' | 'test';
  enableLogging: boolean;
  enableMetrics: boolean;
  thresholds?: Record<string, number>;
}

// Result type for agent operations
export type AgentResult<T> = {
  success: true;
  data: T;
  timestamp: Date;
} | {
  success: false;
  error: string;
  timestamp: Date;
};

// Performance monitoring context
export interface MonitoringContext {
  startTime: Date;
  campaignId: string;
  operation: string;
  metadata?: Record<string, unknown>;
}