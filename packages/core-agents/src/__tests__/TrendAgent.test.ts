/**
 * TrendAgent Tests
 */

import { TrendAgent, ProductType } from '../index';
import { Logger } from '../../../types/src/index';

// Mock logger for testing
const mockLogger: Logger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

describe('TrendAgent', () => {
  let trendAgent: TrendAgent;

  const mockProductTypes: ProductType[] = [
    {
      id: 'tech',
      name: 'Tech Products',
      category: 'technology',
      targetDemographics: ['millennials', 'gen-z'],
      keywords: ['tech', 'AI', 'digital', 'smart'],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    trendAgent = new TrendAgent(mockLogger, mockProductTypes);
  });

  describe('initialization', () => {
    it('should initialize with logger and product types', () => {
      expect(mockLogger.info).toHaveBeenCalledWith(
        'TrendAgent initialized',
        { productTypesCount: 1 }
      );
    });

    it('should initialize with empty product types if none provided', () => {
      const agentWithoutProducts = new TrendAgent(mockLogger);
      expect(mockLogger.info).toHaveBeenLastCalledWith(
        'TrendAgent initialized',
        { productTypesCount: 0 }
      );
    });
  });

  describe('scanTrends', () => {
    it('should scan TikTok trends successfully', async () => {
      const result = await trendAgent.scanTrends('tiktok');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.platform).toBe('tiktok');
        expect(result.data.trends).toBeInstanceOf(Array);
        expect(result.data.trends.length).toBeGreaterThan(0);
        expect(result.data.topHashtags).toBeInstanceOf(Array);
        expect(result.data.engagementSpikes).toBeInstanceOf(Array);
        expect(typeof result.data.totalEngagement).toBe('number');
      }
    });

    it('should scan Instagram trends successfully', async () => {
      const result = await trendAgent.scanTrends('instagram');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.platform).toBe('instagram');
        expect(result.data.trends).toBeInstanceOf(Array);
        expect(result.data.trends.length).toBeGreaterThan(0);
      }
    });

    it('should scan YouTube trends successfully', async () => {
      const result = await trendAgent.scanTrends('youtube');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.platform).toBe('youtube');
        expect(result.data.trends).toBeInstanceOf(Array);
      }
    });

    it('should scan Twitter trends successfully', async () => {
      const result = await trendAgent.scanTrends('twitter');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.platform).toBe('twitter');
        expect(result.data.trends).toBeInstanceOf(Array);
      }
    });

    it('should log scanning activity', async () => {
      await trendAgent.scanTrends('tiktok');

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Scanning trends for platform: tiktok'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Successfully scanned'),
        expect.any(Object)
      );
    });
  });

  describe('recommendTrendActions', () => {
    it('should generate trend action recommendations', async () => {
      const result = await trendAgent.recommendTrendActions();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeInstanceOf(Array);
        expect(result.data.length).toBeGreaterThan(0);

        // Check structure of first recommendation
        const firstRec = result.data[0];
        expect(firstRec).toHaveProperty('id');
        expect(firstRec).toHaveProperty('type');
        expect(firstRec).toHaveProperty('trend');
        expect(firstRec).toHaveProperty('priority');
        expect(firstRec).toHaveProperty('confidence');
        expect(firstRec).toHaveProperty('recommendation');
        expect(firstRec).toHaveProperty('estimatedReach');
        expect(firstRec).toHaveProperty('productAlignment');
        expect(firstRec).toHaveProperty('actionItems');
        expect(firstRec.actionItems).toBeInstanceOf(Array);
      }
    });

    it('should accept platform signals as input', async () => {
      const scanResult = await trendAgent.scanTrends('tiktok');
      expect(scanResult.success).toBe(true);

      if (scanResult.success) {
        const result = await trendAgent.recommendTrendActions([scanResult.data]);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBeInstanceOf(Array);
          expect(result.data.length).toBeGreaterThan(0);
        }
      }
    });

    it('should sort recommendations by priority and confidence', async () => {
      const result = await trendAgent.recommendTrendActions();

      expect(result.success).toBe(true);
      if (result.success && result.data.length > 1) {
        const recommendations = result.data;
        const priorityWeights = { urgent: 4, high: 3, medium: 2, low: 1 };
        
        for (let i = 0; i < recommendations.length - 1; i++) {
          const current = recommendations[i];
          const next = recommendations[i + 1];
          
          const currentWeight = priorityWeights[current.priority];
          const nextWeight = priorityWeights[next.priority];
          
          if (currentWeight === nextWeight) {
            expect(current.confidence).toBeGreaterThanOrEqual(next.confidence);
          } else {
            expect(currentWeight).toBeGreaterThanOrEqual(nextWeight);
          }
        }
      }
    });

    it('should log recommendation generation activity', async () => {
      await trendAgent.recommendTrendActions();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Generating trend action recommendations'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Generated'),
        expect.any(Object)
      );
    });
  });

  describe('product types management', () => {
    it('should set new product types', () => {
      const newProductTypes: ProductType[] = [
        {
          id: 'fashion',
          name: 'Fashion Items',
          category: 'lifestyle',
          targetDemographics: ['gen-z'],
          keywords: ['fashion', 'style', 'clothing'],
        },
      ];

      trendAgent.setProductTypes(newProductTypes);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Product types updated',
        { count: 1 }
      );
    });

    it('should get current product types', () => {
      const productTypes = trendAgent.getProductTypes();

      expect(productTypes).toEqual(mockProductTypes);
      expect(productTypes).not.toBe(mockProductTypes); // Should be a copy
    });
  });

  describe('trend data structure', () => {
    it('should generate trends with required properties', async () => {
      const result = await trendAgent.scanTrends('tiktok');

      expect(result.success).toBe(true);
      if (result.success) {
        const trend = result.data.trends[0];
        
        expect(trend).toHaveProperty('id');
        expect(trend).toHaveProperty('platform');
        expect(trend).toHaveProperty('title');
        expect(trend).toHaveProperty('hashtags');
        expect(trend).toHaveProperty('engagementScore');
        expect(trend).toHaveProperty('viralityIndex');
        expect(trend).toHaveProperty('category');
        expect(trend).toHaveProperty('createdAt');
        expect(trend).toHaveProperty('metadata');

        expect(typeof trend.id).toBe('string');
        expect(trend.platform).toBe('tiktok');
        expect(typeof trend.title).toBe('string');
        expect(Array.isArray(trend.hashtags)).toBe(true);
        expect(typeof trend.engagementScore).toBe('number');
        expect(typeof trend.viralityIndex).toBe('number');
        expect(typeof trend.category).toBe('string');
        expect(trend.createdAt).toBeInstanceOf(Date);
        expect(typeof trend.metadata).toBe('object');
      }
    });
  });
});