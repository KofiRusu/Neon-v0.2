import type { Agent, AgentContext, AgentResult, MonitoringContext } from './types';
import type { 
  CampaignPerformanceAnalysis, 
  OptimizationRecommendation, 
  CampaignHealthScore,
  PerformanceThresholds,
  DEFAULT_THRESHOLDS,
  CampaignMetric,
  CampaignInsight,
  InsightType,
  Severity
} from '@/data-model';
import { prisma } from '@/data-model';
import { 
  calculateMetrics, 
  detectThresholdViolation, 
  detectAnomalies, 
  calculateTrend, 
  calculateHealthScore,
  createLogger 
} from './utils';

/**
 * InsightAgent - Real-time KPI monitoring and campaign optimization
 * 
 * Features:
 * - Analyzes campaign performance metrics
 * - Detects anomalies (low CTR, high CPA, low ROI)
 * - Generates optimization recommendations
 * - Triggers alerts and logs for critical issues
 */
export class InsightAgent implements Agent {
  readonly name = 'InsightAgent';
  readonly version = '1.0.0';
  
  private logger = createLogger('InsightAgent');
  private context: AgentContext;
  private thresholds: PerformanceThresholds;
  private isInitialized = false;

  constructor(context: AgentContext, customThresholds?: Partial<PerformanceThresholds>) {
    this.context = context;
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...customThresholds };
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing InsightAgent', {
      version: this.version,
      thresholds: this.thresholds
    });
    
    try {
      // Test database connection
      await prisma.$connect();
      this.isInitialized = true;
      this.logger.info('InsightAgent initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize InsightAgent', { error });
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    this.logger.info('Shutting down InsightAgent');
    await prisma.$disconnect();
    this.isInitialized = false;
  }

  /**
   * Analyze campaign performance and detect anomalies
   */
  async analyzeCampaignPerformance(
    campaignId: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<AgentResult<CampaignPerformanceAnalysis>> {
    const startTime = new Date();
    const monitoringCtx: MonitoringContext = {
      startTime,
      campaignId,
      operation: 'analyzeCampaignPerformance'
    };

    try {
      this.ensureInitialized();
      
      // Default to last 7 days if no time range provided
      const defaultEnd = new Date();
      const defaultStart = new Date(defaultEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
      const period = timeRange || { start: defaultStart, end: defaultEnd };

      this.logger.info('Starting campaign performance analysis', {
        campaignId,
        period
      });

      // Fetch campaign metrics
      const metrics = await this.fetchCampaignMetrics(campaignId, period);
      
      if (metrics.length === 0) {
        this.logger.warn('No metrics found for campaign', { campaignId, period });
        return {
          success: false,
          error: 'No metrics found for the specified campaign and time period',
          timestamp: new Date()
        };
      }

      // Calculate summary statistics
      const summary = this.calculateSummaryMetrics(metrics);
      
      // Detect anomalies
      const anomalies = await this.detectPerformanceAnomalies(metrics);
      
      // Generate insights
      const insights = await this.generateInsights(campaignId, summary, anomalies);
      
      const analysis: CampaignPerformanceAnalysis = {
        campaignId,
        period,
        summary,
        insights,
        anomalies
      };

      // Log performance metrics
      const duration = new Date().getTime() - startTime.getTime();
      this.logger.info('Campaign performance analysis completed', {
        campaignId,
        duration,
        metricsCount: metrics.length,
        anomaliesCount: anomalies.length,
        insightsCount: insights.length
      });

      return {
        success: true,
        data: analysis,
        timestamp: new Date()
      };

    } catch (error) {
      this.logger.error('Failed to analyze campaign performance', {
        campaignId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date()
      };
    }
  }

  /**
   * Generate optimization recommendations for a campaign
   */
  async recommendOptimization(campaignId: string): Promise<AgentResult<OptimizationRecommendation[]>> {
    const startTime = new Date();
    
    try {
      this.ensureInitialized();
      
      this.logger.info('Generating optimization recommendations', { campaignId });

      // Get recent performance analysis
      const analysisResult = await this.analyzeCampaignPerformance(campaignId);
      
      if (!analysisResult.success) {
        return analysisResult as AgentResult<OptimizationRecommendation[]>;
      }

      const analysis = analysisResult.data;
      const recommendations: OptimizationRecommendation[] = [];

      // Generate recommendations based on performance issues
      recommendations.push(...this.generatePerformanceRecommendations(analysis));
      recommendations.push(...this.generateBudgetRecommendations(analysis));
      recommendations.push(...this.generateTargetingRecommendations(analysis));

      // Sort by priority
      recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      const duration = new Date().getTime() - startTime.getTime();
      this.logger.info('Optimization recommendations generated', {
        campaignId,
        duration,
        recommendationsCount: recommendations.length
      });

      return {
        success: true,
        data: recommendations,
        timestamp: new Date()
      };

    } catch (error) {
      this.logger.error('Failed to generate optimization recommendations', {
        campaignId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get campaign health score
   */
  async getCampaignHealthScore(campaignId: string): Promise<AgentResult<CampaignHealthScore>> {
    try {
      this.ensureInitialized();
      
      const analysisResult = await this.analyzeCampaignPerformance(campaignId);
      
      if (!analysisResult.success) {
        return analysisResult as AgentResult<CampaignHealthScore>;
      }

      const analysis = analysisResult.data;
      const { summary } = analysis;
      
      const healthScore = calculateHealthScore(
        summary.avgCtr,
        summary.avgCpa,
        summary.roi,
        summary.totalSpend,
        this.thresholds
      );

      // Determine trend
      const recentMetrics = await this.fetchCampaignMetrics(campaignId, {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: new Date()
      });

      const timeSeriesData = recentMetrics.map(m => ({
        timestamp: m.timestamp,
        value: m.roi || 0,
        metric: 'roi'
      }));

      const trend = calculateTrend(timeSeriesData);

      const healthResult: CampaignHealthScore = {
        campaignId,
        overall: healthScore.overall,
        breakdown: healthScore.breakdown,
        trend
      };

      return {
        success: true,
        data: healthResult,
        timestamp: new Date()
      };

    } catch (error) {
      this.logger.error('Failed to calculate health score', {
        campaignId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date()
      };
    }
  }

  // Private helper methods

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('InsightAgent not initialized. Call initialize() first.');
    }
  }

  private async fetchCampaignMetrics(
    campaignId: string, 
    period: { start: Date; end: Date }
  ): Promise<CampaignMetric[]> {
    return await prisma.campaignMetric.findMany({
      where: {
        campaignId,
        timestamp: {
          gte: period.start,
          lte: period.end
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });
  }

  private calculateSummaryMetrics(metrics: CampaignMetric[]) {
    const totals = metrics.reduce((acc, metric) => {
      const calculated = calculateMetrics(metric);
      
      return {
        totalImpressions: acc.totalImpressions + metric.impressions,
        totalClicks: acc.totalClicks + metric.clicks,
        totalConversions: acc.totalConversions + metric.conversions,
        totalSpend: acc.totalSpend + metric.spend,
        totalRevenue: acc.totalRevenue + metric.revenue,
        ctrSum: acc.ctrSum + calculated.ctr,
        cpcSum: acc.cpcSum + calculated.cpc,
        cpaSum: acc.cpaSum + calculated.cpa,
        count: acc.count + 1
      };
    }, {
      totalImpressions: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalSpend: 0,
      totalRevenue: 0,
      ctrSum: 0,
      cpcSum: 0,
      cpaSum: 0,
      count: 0
    });

    return {
      totalImpressions: totals.totalImpressions,
      totalClicks: totals.totalClicks,
      totalConversions: totals.totalConversions,
      totalSpend: totals.totalSpend,
      totalRevenue: totals.totalRevenue,
      avgCtr: totals.count > 0 ? totals.ctrSum / totals.count : 0,
      avgCpc: totals.count > 0 ? totals.cpcSum / totals.count : 0,
      avgCpa: totals.count > 0 ? totals.cpaSum / totals.count : 0,
      roi: totals.totalSpend > 0 ? (totals.totalRevenue - totals.totalSpend) / totals.totalSpend : 0,
      roas: totals.totalSpend > 0 ? totals.totalRevenue / totals.totalSpend : 0
    };
  }

  private async detectPerformanceAnomalies(metrics: CampaignMetric[]) {
    const timeSeriesData = metrics.map(m => ({
      timestamp: m.timestamp,
      value: m.ctr || 0,
      metric: 'ctr'
    }));

    const anomalies = detectAnomalies(timeSeriesData);
    
    return anomalies.map((anomaly, index) => ({
      metric: 'ctr',
      currentValue: timeSeriesData[index].value,
      expectedValue: timeSeriesData.reduce((sum, d) => sum + d.value, 0) / timeSeriesData.length,
      deviation: anomaly.score,
      severity: anomaly.isAnomaly ? (anomaly.score > 3 ? 'high' : 'medium') : 'low',
      description: anomaly.description
    }));
  }

  private async generateInsights(
    campaignId: string, 
    summary: any, 
    anomalies: any[]
  ): Promise<CampaignInsight[]> {
    const insights: Omit<CampaignInsight, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    // Check CTR threshold
    const ctrViolation = detectThresholdViolation('ctr', summary.avgCtr, this.thresholds);
    if (ctrViolation.violated) {
      insights.push({
        campaignId,
        type: 'LOW_CTR' as InsightType,
        severity: ctrViolation.severity === 'critical' ? 'CRITICAL' : 'WARNING',
        title: 'Low Click-Through Rate Detected',
        description: `Campaign CTR (${(summary.avgCtr * 100).toFixed(2)}%) is below threshold`,
        currentValue: summary.avgCtr,
        thresholdValue: this.thresholds.ctr.warning,
        recommendation: 'Consider improving ad creative or targeting',
        actionItems: ['Review ad copy', 'Test new creative assets', 'Refine audience targeting'],
        detectedAt: new Date(),
        isResolved: false
      });
    }

    // Check CPA threshold
    const cpaViolation = detectThresholdViolation('cpa', summary.avgCpa, this.thresholds);
    if (cpaViolation.violated) {
      insights.push({
        campaignId,
        type: 'HIGH_CPA' as InsightType,
        severity: cpaViolation.severity === 'critical' ? 'CRITICAL' : 'WARNING',
        title: 'High Cost Per Acquisition',
        description: `Campaign CPA ($${summary.avgCpa.toFixed(2)}) exceeds threshold`,
        currentValue: summary.avgCpa,
        thresholdValue: this.thresholds.cpa.warning,
        recommendation: 'Optimize bidding strategy and targeting',
        actionItems: ['Lower bid amounts', 'Pause underperforming keywords', 'Improve landing page conversion'],
        detectedAt: new Date(),
        isResolved: false
      });
    }

    // Check ROI threshold
    const roiViolation = detectThresholdViolation('roi', summary.roi, this.thresholds);
    if (roiViolation.violated) {
      insights.push({
        campaignId,
        type: 'LOW_ROI' as InsightType,
        severity: roiViolation.severity === 'critical' ? 'CRITICAL' : 'WARNING',
        title: 'Low Return on Investment',
        description: `Campaign ROI (${(summary.roi * 100).toFixed(1)}%) is below target`,
        currentValue: summary.roi,
        thresholdValue: this.thresholds.roi.warning,
        recommendation: 'Review campaign profitability and optimization opportunities',
        actionItems: ['Analyze high-performing segments', 'Reduce spend on poor performers', 'Optimize conversion funnel'],
        detectedAt: new Date(),
        isResolved: false
      });
    }

    // Save insights to database
    const savedInsights = await Promise.all(
      insights.map(insight => 
        prisma.campaignInsight.create({ data: insight })
      )
    );

    return savedInsights;
  }

  private generatePerformanceRecommendations(analysis: CampaignPerformanceAnalysis): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    const { summary } = analysis;

    if (summary.avgCtr < this.thresholds.ctr.warning) {
      recommendations.push({
        campaignId: analysis.campaignId,
        type: 'creative',
        priority: 'high',
        title: 'Improve Creative Performance',
        description: 'Low CTR indicates creative fatigue or poor audience fit',
        expectedImpact: 'Could improve CTR by 50-100%',
        actionItems: [
          'Test new ad creative variations',
          'Analyze competitor creatives',
          'Refine audience targeting',
          'A/B test different headlines and descriptions'
        ],
        estimatedEffort: 'medium'
      });
    }

    if (summary.avgCpa > this.thresholds.cpa.warning) {
      recommendations.push({
        campaignId: analysis.campaignId,
        type: 'bidding',
        priority: 'high',
        title: 'Optimize Bidding Strategy',
        description: 'High CPA suggests inefficient bidding or poor targeting',
        expectedImpact: 'Could reduce CPA by 20-40%',
        actionItems: [
          'Lower bid amounts for high-cost keywords',
          'Implement automated bidding strategies',
          'Add negative keywords',
          'Optimize for conversion value'
        ],
        estimatedEffort: 'low'
      });
    }

    return recommendations;
  }

  private generateBudgetRecommendations(analysis: CampaignPerformanceAnalysis): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    const { summary } = analysis;

    if (summary.roi > 0.5 && summary.totalSpend < 1000) {
      recommendations.push({
        campaignId: analysis.campaignId,
        type: 'budget',
        priority: 'medium',
        title: 'Scale Successful Campaign',
        description: 'Good ROI suggests opportunity to increase budget',
        expectedImpact: 'Could increase revenue by 30-50%',
        actionItems: [
          'Gradually increase daily budget',
          'Monitor performance closely',
          'Expand to similar audiences',
          'Add more high-performing keywords'
        ],
        estimatedEffort: 'low'
      });
    }

    return recommendations;
  }

  private generateTargetingRecommendations(analysis: CampaignPerformanceAnalysis): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    if (analysis.anomalies.some(a => a.severity === 'high')) {
      recommendations.push({
        campaignId: analysis.campaignId,
        type: 'targeting',
        priority: 'medium',
        title: 'Refine Audience Targeting',
        description: 'Performance anomalies suggest targeting issues',
        expectedImpact: 'Could improve overall performance by 25%',
        actionItems: [
          'Analyze audience segments',
          'Exclude poor-performing demographics',
          'Test lookalike audiences',
          'Implement interest-based targeting'
        ],
        estimatedEffort: 'medium'
      });
    }

    return recommendations;
  }
}