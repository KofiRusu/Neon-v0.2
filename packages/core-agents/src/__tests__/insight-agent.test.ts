/**
 * Tests for InsightAgent
 */

import { InsightAgent } from '../insight-agent';
import type { AgentContext } from '../types';

// Mock Prisma client
jest.mock('@/data-model', () => ({
  prisma: {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    campaignMetric: {
      findMany: jest.fn()
    },
    campaignInsight: {
      create: jest.fn()
    }
  }
}));

describe('InsightAgent', () => {
  let insightAgent: InsightAgent;
  let mockContext: AgentContext;

  beforeEach(() => {
    mockContext = {
      logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn()
      },
      config: {
        environment: 'test',
        enableLogging: true,
        enableMetrics: true
      }
    };

    insightAgent = new InsightAgent(mockContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      const { prisma } = require('@/data-model');
      prisma.$connect.mockResolvedValue(undefined);

      await insightAgent.initialize();

      expect(prisma.$connect).toHaveBeenCalled();
      expect(mockContext.logger.info).toHaveBeenCalledWith(
        'InsightAgent initialized successfully'
      );
    });

    it('should handle initialization failure', async () => {
      const { prisma } = require('@/data-model');
      const error = new Error('Connection failed');
      prisma.$connect.mockRejectedValue(error);

      await expect(insightAgent.initialize()).rejects.toThrow('Connection failed');
      expect(mockContext.logger.error).toHaveBeenCalled();
    });
  });

  describe('analyzeCampaignPerformance', () => {
    const mockMetrics = [
      {
        id: '1',
        campaignId: 'campaign_123',
        timestamp: new Date('2024-01-01'),
        impressions: 1000,
        clicks: 20,
        conversions: 2,
        spend: 50,
        revenue: 100,
        ctr: 0.02,
        cpc: 2.5,
        cpa: 25,
        roi: 1.0,
        roas: 2.0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        campaignId: 'campaign_123',
        timestamp: new Date('2024-01-02'),
        impressions: 1200,
        clicks: 15,
        conversions: 1,
        spend: 60,
        revenue: 40,
        ctr: 0.0125,
        cpc: 4.0,
        cpa: 60,
        roi: -0.33,
        roas: 0.67,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    beforeEach(async () => {
      const { prisma } = require('@/data-model');
      prisma.$connect.mockResolvedValue(undefined);
      await insightAgent.initialize();
    });

    it('should analyze campaign performance successfully', async () => {
      const { prisma } = require('@/data-model');
      prisma.campaignMetric.findMany.mockResolvedValue(mockMetrics);
      prisma.campaignInsight.create.mockResolvedValue({
        id: 'insight_1',
        ...mockMetrics[0]
      });

      const result = await insightAgent.analyzeCampaignPerformance('campaign_123');

      expect(result.success).toBe(true);
      expect(result.data.campaignId).toBe('campaign_123');
      expect(result.data.summary.totalImpressions).toBe(2200);
      expect(result.data.summary.totalClicks).toBe(35);
      expect(result.data.summary.totalConversions).toBe(3);
      expect(result.data.summary.totalSpend).toBe(110);
      expect(result.data.summary.totalRevenue).toBe(140);
    });

    it('should handle no metrics found', async () => {
      const { prisma } = require('@/data-model');
      prisma.campaignMetric.findMany.mockResolvedValue([]);

      const result = await insightAgent.analyzeCampaignPerformance('campaign_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('No metrics found for the specified campaign and time period');
    });

    it('should detect low CTR insights', async () => {
      const { prisma } = require('@/data-model');
      const lowCtrMetrics = mockMetrics.map(m => ({ ...m, ctr: 0.003 })); // Very low CTR
      prisma.campaignMetric.findMany.mockResolvedValue(lowCtrMetrics);
      prisma.campaignInsight.create.mockResolvedValue({
        id: 'insight_1',
        type: 'LOW_CTR',
        severity: 'CRITICAL',
        title: 'Low Click-Through Rate Detected'
      });

      const result = await insightAgent.analyzeCampaignPerformance('campaign_123');

      expect(result.success).toBe(true);
      expect(prisma.campaignInsight.create).toHaveBeenCalled();
      expect(mockContext.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Campaign performance analysis completed'),
        expect.any(Object)
      );
    });
  });

  describe('recommendOptimization', () => {
    beforeEach(async () => {
      const { prisma } = require('@/data-model');
      prisma.$connect.mockResolvedValue(undefined);
      await insightAgent.initialize();
    });

    it('should generate optimization recommendations', async () => {
      const { prisma } = require('@/data-model');
      const poorPerformanceMetrics = [
        {
          ...mockMetrics[0],
          ctr: 0.005, // Low CTR
          cpa: 80,    // High CPA
          roi: 0.1    // Low ROI
        }
      ];
      
      prisma.campaignMetric.findMany.mockResolvedValue(poorPerformanceMetrics);
      prisma.campaignInsight.create.mockResolvedValue({
        id: 'insight_1',
        type: 'LOW_CTR'
      });

      const result = await insightAgent.recommendOptimization('campaign_123');

      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      
      // Should have creative and bidding recommendations
      const recommendations = result.data;
      expect(recommendations.some(r => r.type === 'creative')).toBe(true);
      expect(recommendations.some(r => r.type === 'bidding')).toBe(true);
      
      // Should be sorted by priority
      const priorities = recommendations.map(r => r.priority);
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      for (let i = 1; i < priorities.length; i++) {
        expect(priorityOrder[priorities[i-1]]).toBeGreaterThanOrEqual(priorityOrder[priorities[i]]);
      }
    });

    it('should handle analysis failure in recommendations', async () => {
      const { prisma } = require('@/data-model');
      prisma.campaignMetric.findMany.mockResolvedValue([]);

      const result = await insightAgent.recommendOptimization('campaign_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('No metrics found for the specified campaign and time period');
    });
  });

  describe('getCampaignHealthScore', () => {
    beforeEach(async () => {
      const { prisma } = require('@/data-model');
      prisma.$connect.mockResolvedValue(undefined);
      await insightAgent.initialize();
    });

    it('should calculate health score successfully', async () => {
      const { prisma } = require('@/data-model');
      prisma.campaignMetric.findMany.mockResolvedValue(mockMetrics);
      prisma.campaignInsight.create.mockResolvedValue({
        id: 'insight_1'
      });

      const result = await insightAgent.getCampaignHealthScore('campaign_123');

      expect(result.success).toBe(true);
      expect(result.data.campaignId).toBe('campaign_123');
      expect(result.data.overall).toBeGreaterThanOrEqual(0);
      expect(result.data.overall).toBeLessThanOrEqual(100);
      expect(result.data.breakdown).toHaveProperty('ctr');
      expect(result.data.breakdown).toHaveProperty('cpa');
      expect(result.data.breakdown).toHaveProperty('roi');
      expect(result.data.breakdown).toHaveProperty('spend');
      expect(['improving', 'stable', 'declining']).toContain(result.data.trend);
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      const { prisma } = require('@/data-model');
      prisma.$connect.mockResolvedValue(undefined);
      await insightAgent.initialize();
      
      prisma.campaignMetric.findMany.mockRejectedValue(new Error('Database error'));

      const result = await insightAgent.analyzeCampaignPerformance('campaign_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
      expect(mockContext.logger.error).toHaveBeenCalled();
    });

    it('should require initialization before operations', async () => {
      const result = await insightAgent.analyzeCampaignPerformance('campaign_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('InsightAgent not initialized. Call initialize() first.');
    });
  });

  describe('custom thresholds', () => {
    it('should use custom thresholds when provided', async () => {
      const customThresholds = {
        ctr: {
          warning: 0.03,  // Higher than default
          critical: 0.01
        }
      };

      const customAgent = new InsightAgent(mockContext, customThresholds);
      
      const { prisma } = require('@/data-model');
      prisma.$connect.mockResolvedValue(undefined);
      await customAgent.initialize();
      
      // Test with metrics that would trigger default thresholds but not custom ones
      const borderlineMetrics = [
        {
          ...mockMetrics[0],
          ctr: 0.02 // Between default and custom thresholds
        }
      ];
      
      prisma.campaignMetric.findMany.mockResolvedValue(borderlineMetrics);
      prisma.campaignInsight.create.mockResolvedValue({
        id: 'insight_1'
      });

      const result = await customAgent.analyzeCampaignPerformance('campaign_123');

      expect(result.success).toBe(true);
      // With custom higher thresholds, should still trigger low CTR warning
      expect(prisma.campaignInsight.create).toHaveBeenCalled();
    });
  });

  describe('shutdown', () => {
    it('should shutdown gracefully', async () => {
      const { prisma } = require('@/data-model');
      prisma.$connect.mockResolvedValue(undefined);
      prisma.$disconnect.mockResolvedValue(undefined);
      
      await insightAgent.initialize();
      await insightAgent.shutdown();

      expect(prisma.$disconnect).toHaveBeenCalled();
      expect(mockContext.logger.info).toHaveBeenCalledWith('Shutting down InsightAgent');
    });
  });
});