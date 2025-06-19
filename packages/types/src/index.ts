/**
 * Common type definitions for Neon0.2 monorepo
 */

// Base entity interface
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Configuration interface
export interface Config {
  environment: 'development' | 'production' | 'test';
  apiUrl: string;
  version: string;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Event types
export interface BaseEvent {
  type: string;
  timestamp: Date;
  payload: Record<string, unknown>;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Async operation result
export type Result<T, E = AppError> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Logger interface
export interface Logger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}

// AuditAgent specific types
export interface QualityScore {
  relevance: number;
  clarity: number;
  grammar: number;
  engagement: number;
  overall: number;
}

export interface EvaluationCriteria {
  relevance: {
    weight: number;
    description: string;
  };
  clarity: {
    weight: number;
    description: string;
  };
  grammar: {
    weight: number;
    description: string;
  };
  engagement: {
    weight: number;
    description: string;
  };
}

export interface HallucinationCheck {
  isHallucination: boolean;
  confidence: number;
  reasons: string[];
}

export interface AgentPerformanceMetrics {
  agent: string;
  totalEvaluations: number;
  averageScore: number;
  hallucinationRate: number;
  lastEvaluated: Date;
  scoreTrend: number[]; // Last 10 scores
} 