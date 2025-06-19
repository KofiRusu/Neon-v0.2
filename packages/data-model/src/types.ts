import type { CampaignMetric, CampaignInsight, Campaign } from '@prisma/client';

// Extended types for better type safety and utility

export interface CampaignMetricWithCalculated extends CampaignMetric {
  // Ensures calculated metrics are always present
  ctr: number;
  cpc: number;
  cpa: number;
  roi: number;
  roas: number;
}

export interface CampaignPerformanceAnalysis {
  campaignId: string;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    totalSpend: number;
    totalRevenue: number;
    avgCtr: number;
    avgCpc: number;
    avgCpa: number;
    roi: number;
    roas: number;
  };
  insights: CampaignInsight[];
  anomalies: PerformanceAnomaly[];
}

export interface PerformanceAnomaly {
  metric: string;
  currentValue: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface OptimizationRecommendation {
  campaignId: string;
  type: 'budget' | 'targeting' | 'creative' | 'bidding';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  expectedImpact: string;
  actionItems: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
}

export interface CampaignHealthScore {
  campaignId: string;
  overall: number; // 0-100
  breakdown: {
    ctr: number;
    cpa: number;
    roi: number;
    spend: number;
  };
  trend: 'improving' | 'stable' | 'declining';
}

// Thresholds for performance monitoring
export interface PerformanceThresholds {
  ctr: {
    warning: number;
    critical: number;
  };
  cpa: {
    warning: number;
    critical: number;
  };
  roi: {
    warning: number;
    critical: number;
  };
  roas: {
    warning: number;
    critical: number;
  };
}

export const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  ctr: {
    warning: 0.01, // 1%
    critical: 0.005 // 0.5%
  },
  cpa: {
    warning: 50,
    critical: 100
  },
  roi: {
    warning: 0.2, // 20%
    critical: 0.0 // 0%
  },
  roas: {
    warning: 1.5,
    critical: 1.0
  }
};

// Utility type for time-based analysis
export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  metric: string;
}