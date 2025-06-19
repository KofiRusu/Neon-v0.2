import type { CampaignMetric } from '@/data-model';
import type { PerformanceThresholds, TimeSeriesData } from '@/data-model';

/**
 * Calculate derived metrics from raw campaign data
 */
export function calculateMetrics(metric: Omit<CampaignMetric, 'ctr' | 'cpc' | 'cpa' | 'roi' | 'roas'>) {
  const ctr = metric.impressions > 0 ? metric.clicks / metric.impressions : 0;
  const cpc = metric.clicks > 0 ? metric.spend / metric.clicks : 0;
  const cpa = metric.conversions > 0 ? metric.spend / metric.conversions : 0;
  const roi = metric.spend > 0 ? (metric.revenue - metric.spend) / metric.spend : 0;
  const roas = metric.spend > 0 ? metric.revenue / metric.spend : 0;

  return {
    ctr,
    cpc,
    cpa,
    roi,
    roas
  };
}

/**
 * Check if a metric value violates thresholds
 */
export function detectThresholdViolation(
  metric: string,
  value: number,
  thresholds: PerformanceThresholds
): { violated: boolean; severity: 'warning' | 'critical' | null } {
  const threshold = thresholds[metric as keyof PerformanceThresholds];
  if (!threshold) {
    return { violated: false, severity: null };
  }

  // For metrics where lower is worse (CTR, ROI, ROAS)
  if (metric === 'ctr' || metric === 'roi' || metric === 'roas') {
    if (value <= threshold.critical) {
      return { violated: true, severity: 'critical' };
    }
    if (value <= threshold.warning) {
      return { violated: true, severity: 'warning' };
    }
  }
  
  // For metrics where higher is worse (CPA)
  if (metric === 'cpa') {
    if (value >= threshold.critical) {
      return { violated: true, severity: 'critical' };
    }
    if (value >= threshold.warning) {
      return { violated: true, severity: 'warning' };
    }
  }

  return { violated: false, severity: null };
}

/**
 * Detect anomalies in time series data using simple statistical methods
 */
export function detectAnomalies(
  data: TimeSeriesData[],
  sensitivityFactor: number = 2
): { isAnomaly: boolean; score: number; description: string }[] {
  if (data.length < 3) {
    return data.map(() => ({ isAnomaly: false, score: 0, description: 'Insufficient data' }));
  }

  const values = data.map(d => d.value);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return data.map((point, index) => {
    const deviation = Math.abs(point.value - mean);
    const score = stdDev > 0 ? deviation / stdDev : 0;
    const isAnomaly = score > sensitivityFactor;
    
    let description = 'Normal';
    if (isAnomaly) {
      const direction = point.value > mean ? 'spike' : 'drop';
      description = `Significant ${direction} detected (${score.toFixed(2)}σ from mean)`;
    }

    return {
      isAnomaly,
      score,
      description
    };
  });
}

/**
 * Calculate trend direction from time series data
 */
export function calculateTrend(data: TimeSeriesData[]): 'improving' | 'stable' | 'declining' {
  if (data.length < 2) return 'stable';

  // Simple linear regression to determine trend
  const n = data.length;
  const x = data.map((_, i) => i);
  const y = data.map(d => d.value);
  
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
  if (Math.abs(slope) < 0.01) return 'stable';
  return slope > 0 ? 'improving' : 'declining';
}

/**
 * Generate performance health score (0-100)
 */
export function calculateHealthScore(
  ctr: number,
  cpa: number,
  roi: number,
  spend: number,
  thresholds: PerformanceThresholds
): { overall: number; breakdown: { ctr: number; cpa: number; roi: number; spend: number } } {
  // Score CTR (0-25 points)
  const ctrScore = Math.min(25, (ctr / (thresholds.ctr.warning * 2)) * 25);
  
  // Score CPA (0-25 points, inverted since lower is better)
  const cpaScore = Math.max(0, 25 - ((cpa / thresholds.cpa.warning) * 25));
  
  // Score ROI (0-25 points)
  const roiScore = Math.min(25, ((roi + 1) / (thresholds.roi.warning + 1)) * 25);
  
  // Score spend efficiency (0-25 points, based on reasonable spend levels)
  const spendScore = spend > 0 && spend < 10000 ? 25 : Math.max(0, 25 - (spend / 1000));
  
  return {
    overall: Math.round(ctrScore + cpaScore + roiScore + spendScore),
    breakdown: {
      ctr: Math.round(ctrScore),
      cpa: Math.round(cpaScore),
      roi: Math.round(roiScore),
      spend: Math.round(spendScore)
    }
  };
}

/**
 * Logger utility for consistent logging format
 */
export function createLogger(context: string) {
  return {
    info: (message: string, meta?: Record<string, unknown>) => {
      console.log(`[${context}] INFO: ${message}`, meta ? JSON.stringify(meta) : '');
    },
    warn: (message: string, meta?: Record<string, unknown>) => {
      console.warn(`[${context}] WARN: ${message}`, meta ? JSON.stringify(meta) : '');
    },
    error: (message: string, meta?: Record<string, unknown>) => {
      console.error(`[${context}] ERROR: ${message}`, meta ? JSON.stringify(meta) : '');
    },
    debug: (message: string, meta?: Record<string, unknown>) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[${context}] DEBUG: ${message}`, meta ? JSON.stringify(meta) : '');
      }
    }
  };
}