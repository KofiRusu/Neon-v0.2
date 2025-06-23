import { z } from 'zod';

// Context types for different agent operations
export interface BaseContext {
  userId?: string;
  campaignId?: string;
  platform?: string;
  metadata?: Record<string, unknown>;
}

export interface ContentContext extends BaseContext {
  topic?: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'urgent';
  targetAudience?: string;
  keywords?: string[];
  contentType?: 'post' | 'caption' | 'email' | 'blog' | 'ad';
}

export interface AdContext extends BaseContext {
  budget?: number;
  targetAudience?: {
    demographics?: string[];
    interests?: string[];
    location?: string[];
  };
  bidStrategy?: 'cpc' | 'cpm' | 'cpa';
  adFormat?: 'image' | 'video' | 'carousel' | 'text';
}

export interface OutreachContext extends BaseContext {
  leadIds?: string[];
  templateId?: string;
  personalizations?: Record<string, string>;
  channel?: 'email' | 'sms' | 'linkedin' | 'phone';
}

export interface TrendContext extends BaseContext {
  hashtags?: string[];
  timeframe?: '24h' | '7d' | '30d';
  industry?: string;
  competitors?: string[];
}

export interface DesignContext extends BaseContext {
  assetType?: 'image' | 'video' | 'graphic' | 'logo';
  dimensions?: { width: number; height: number };
  style?: 'modern' | 'classic' | 'minimalist' | 'bold';
  colorScheme?: string[];
}

export interface InsightContext extends BaseContext {
  metrics?: string[];
  dateRange?: { start: Date; end: Date };
  granularity?: 'hour' | 'day' | 'week' | 'month';
}

// Result types for different agent operations
export interface ContentResult {
  posts?: Array<{
    platform: string;
    content: string;
    hashtags: string[];
    imageSuggestions?: string[];
  }>;
  captions?: Array<{
    platform: string;
    caption: string;
    hashtags: string[];
  }>;
  emails?: Array<{
    subject: string;
    body: string;
    type: string;
  }>;
  optimizedContent?: string;
  suggestions?: string[];
  variants?: Array<{
    id: string;
    content: string;
  }>;
  testId?: string;
}

export interface AdResult {
  campaignId?: string;
  optimizations?: Array<{
    type: string;
    change: string;
    expectedImpact: number;
  }>;
  bidRecommendations?: Array<{
    keyword: string;
    suggestedBid: number;
    confidence: number;
  }>;
  audiences?: Array<{
    name: string;
    size: number;
    performance: number;
  }>;
  budgetAllocation?: Record<string, number>;
  performanceMetrics?: Record<string, number>;
}

export interface OutreachResult {
  messagesSent?: number;
  successRate?: number;
  responses?: Array<{
    leadId: string;
    response: string;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>;
  sequences?: Array<{
    id: string;
    name: string;
    steps: number;
  }>;
  leads?: Array<{
    id: string;
    score: number;
    status: string;
  }>;
}

export interface TrendResult {
  hashtags?: Array<{
    tag: string;
    volume: number;
    growth: number;
    relevance: number;
  }>;
  trends?: Array<{
    topic: string;
    volume: number;
    sentiment: number;
    platforms: string[];
  }>;
  insights?: Array<{
    type: string;
    description: string;
    confidence: number;
  }>;
  predictions?: Array<{
    topic: string;
    predictedGrowth: number;
    timeframe: string;
  }>;
  viralContent?: Array<{
    platform: string;
    content: string;
    engagement: number;
  }>;
}

export interface DesignResult {
  assets?: Array<{
    id: string;
    type: string;
    url: string;
    dimensions: { width: number; height: number };
  }>;
  templates?: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  variations?: Array<{
    id: string;
    description: string;
    imageUrl: string;
  }>;
  brandCheck?: {
    compliance: number;
    issues: string[];
    suggestions: string[];
  };
  designSuggestions?: Array<{
    element: string;
    suggestion: string;
    impact: number;
  }>;
}

export interface InsightResult {
  metrics?: Record<string, number>;
  trends?: Array<{
    metric: string;
    direction: 'up' | 'down' | 'stable';
    change: number;
  }>;
  alerts?: Array<{
    type: 'warning' | 'critical' | 'info';
    message: string;
    metric: string;
  }>;
  reports?: Array<{
    id: string;
    title: string;
    summary: string;
    data: Record<string, unknown>;
  }>;
  predictions?: Array<{
    metric: string;
    predictedValue: number;
    confidence: number;
    timeframe: string;
  }>;
}

// Union types for all contexts and results
export type AgentContext = 
  | ContentContext 
  | AdContext 
  | OutreachContext 
  | TrendContext 
  | DesignContext 
  | InsightContext;

export type AgentData = 
  | ContentResult 
  | AdResult 
  | OutreachResult 
  | TrendResult 
  | DesignResult 
  | InsightResult;

// Enhanced schemas with proper typing
export const AgentPayloadSchema = z.object({
  task: z.string(),
  context: z.record(z.unknown()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  deadline: z.date().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const AgentResultSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  performance: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const AgentStatusSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  status: z.enum(['idle', 'running', 'error', 'maintenance']),
  lastExecution: z.date().optional(),
  performance: z.number().optional(),
  capabilities: z.array(z.string()),
});

export type AgentPayload = z.infer<typeof AgentPayloadSchema>;
export type AgentResult = z.infer<typeof AgentResultSchema>;
export type AgentStatus = z.infer<typeof AgentStatusSchema>;