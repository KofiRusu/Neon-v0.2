import { Logger, Result, AppError } from '../../../types/src/index';

/**
 * Platform types supported for trend analysis
 */
export type Platform = 'tiktok' | 'instagram' | 'youtube' | 'twitter';

/**
 * Trend data structure
 */
export interface Trend {
  id: string;
  platform: Platform;
  title: string;
  hashtags: string[];
  sounds?: string[];
  engagementScore: number;
  viralityIndex: number;
  category: string;
  createdAt: Date;
  metadata: Record<string, unknown>;
}

/**
 * Platform signals data structure
 */
export interface PlatformSignals {
  platform: Platform;
  trends: Trend[];
  totalEngagement: number;
  topHashtags: string[];
  topSounds: string[];
  engagementSpikes: EngagementSpike[];
}

/**
 * Engagement spike data
 */
export interface EngagementSpike {
  contentId: string;
  timestamp: Date;
  engagementIncrease: number;
  duration: number; // in minutes
  trigger: string;
}

/**
 * Trend action recommendation
 */
export interface TrendAction {
  id: string;
  type: 'create_content' | 'leverage_hashtag' | 'use_sound' | 'collaborate' | 'timing_optimization';
  trend: Trend;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  confidence: number; // 0-1
  recommendation: string;
  estimatedReach: number;
  productAlignment: number; // 0-1, how well it aligns with product types
  actionItems: string[];
  deadline?: Date;
}

/**
 * Product type for trend alignment
 */
export interface ProductType {
  id: string;
  name: string;
  category: string;
  targetDemographics: string[];
  keywords: string[];
  seasonality?: string[];
}

/**
 * TrendAgent - Detects viral content trends and recommends actions
 */
export class TrendAgent {
  private logger: Logger;
  private productTypes: ProductType[] = [];

  constructor(logger: Logger, productTypes: ProductType[] = []) {
    this.logger = logger;
    this.productTypes = productTypes;
    this.logger.info('TrendAgent initialized', { productTypesCount: productTypes.length });
  }

  /**
   * Scan trends for a specific platform
   * @param platform - The platform to scan (tiktok, instagram, etc.)
   * @returns Promise with platform signals and trends
   */
  async scanTrends(platform: Platform): Promise<Result<PlatformSignals, AppError>> {
    try {
      this.logger.info(`Scanning trends for platform: ${platform}`);

      // Mock data for now - in production this would integrate with actual APIs
      const mockTrends = await this.generateMockTrends(platform);
      const mockEngagementSpikes = await this.generateMockEngagementSpikes(platform);

      const signals: PlatformSignals = {
        platform,
        trends: mockTrends,
        totalEngagement: mockTrends.reduce((sum, trend) => sum + trend.engagementScore, 0),
        topHashtags: this.extractTopHashtags(mockTrends),
        topSounds: this.extractTopSounds(mockTrends),
        engagementSpikes: mockEngagementSpikes,
      };

      this.logger.info(`Successfully scanned ${mockTrends.length} trends for ${platform}`, {
        totalEngagement: signals.totalEngagement,
        topHashtagsCount: signals.topHashtags.length,
      });

      return { success: true, data: signals };
    } catch (error) {
      const appError: AppError = {
        code: 'TREND_SCAN_FAILED',
        message: `Failed to scan trends for platform ${platform}`,
        details: { platform, error: error instanceof Error ? error.message : 'Unknown error' },
      };

      this.logger.error('Trend scanning failed', appError.details);
      return { success: false, error: appError };
    }
  }

  /**
   * Recommend trend-based actions based on current trends
   * @param signals - Optional platform signals, if not provided will scan all platforms
   * @returns Promise with recommended actions
   */
  async recommendTrendActions(signals?: PlatformSignals[]): Promise<Result<TrendAction[], AppError>> {
    try {
      this.logger.info('Generating trend action recommendations');

      let allSignals: PlatformSignals[] = signals || [];

      // If no signals provided, scan all platforms
      if (!signals || signals.length === 0) {
        const platforms: Platform[] = ['tiktok', 'instagram', 'youtube', 'twitter'];
        const scanPromises = platforms.map(platform => this.scanTrends(platform));
        const scanResults = await Promise.all(scanPromises);
        
        allSignals = scanResults
          .filter((result): result is { success: true; data: PlatformSignals } => result.success)
          .map(result => result.data);
      }

      const recommendations: TrendAction[] = [];

      // Process each platform's signals
      for (const platformSignals of allSignals) {
        const platformRecommendations = await this.generateRecommendationsForPlatform(platformSignals);
        recommendations.push(...platformRecommendations);
      }

      // Sort by priority and confidence
      recommendations.sort((a, b) => {
        const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.confidence - a.confidence;
      });

      this.logger.info(`Generated ${recommendations.length} trend action recommendations`, {
        platforms: allSignals.map(s => s.platform),
        highPriorityCount: recommendations.filter(r => r.priority === 'high' || r.priority === 'urgent').length,
      });

      return { success: true, data: recommendations };
    } catch (error) {
      const appError: AppError = {
        code: 'RECOMMENDATION_FAILED',
        message: 'Failed to generate trend action recommendations',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };

      this.logger.error('Trend action recommendation failed', appError.details);
      return { success: false, error: appError };
    }
  }

  /**
   * Generate mock trends for a platform (replace with real API integration)
   */
  private async generateMockTrends(platform: Platform): Promise<Trend[]> {
    const mockTrends: Record<Platform, Partial<Trend>[]> = {
      tiktok: [
        {
          title: 'Dancing with AI Filters',
          hashtags: ['#AIFilter', '#TechDance', '#FutureVibes'],
          sounds: ['ai-beats-2024', 'future-sound-mix'],
          engagementScore: 850000,
          viralityIndex: 0.92,
          category: 'technology',
        },
        {
          title: 'Sustainable Fashion Hauls',
          hashtags: ['#SustainableFashion', '#EcoFriendly', '#GreenStyle'],
          sounds: ['eco-conscious-anthem'],
          engagementScore: 720000,
          viralityIndex: 0.85,
          category: 'lifestyle',
        },
        {
          title: 'Remote Work Setup Tours',
          hashtags: ['#WFH', '#RemoteWork', '#ProductivityHack'],
          sounds: ['work-from-home-vibes'],
          engagementScore: 650000,
          viralityIndex: 0.78,
          category: 'productivity',
        },
      ],
      instagram: [
        {
          title: 'Minimalist Home Decor',
          hashtags: ['#MinimalistHome', '#HomeDecor', '#CleanAesthetic'],
          engagementScore: 420000,
          viralityIndex: 0.73,
          category: 'home',
        },
        {
          title: 'Plant Parent Tips',
          hashtags: ['#PlantParent', '#IndoorGarden', '#PlantTips'],
          engagementScore: 380000,
          viralityIndex: 0.69,
          category: 'lifestyle',
        },
      ],
      youtube: [
        {
          title: 'AI Tool Reviews',
          hashtags: ['#AITools', '#TechReview', '#Productivity'],
          engagementScore: 290000,
          viralityIndex: 0.65,
          category: 'technology',
        },
      ],
      twitter: [
        {
          title: 'Crypto Market Analysis',
          hashtags: ['#Crypto', '#MarketAnalysis', '#Trading'],
          engagementScore: 180000,
          viralityIndex: 0.58,
          category: 'finance',
        },
      ],
    };

    const platformTrends = mockTrends[platform] || [];
    return platformTrends.map((trend, index) => ({
      id: `${platform}-trend-${index + 1}`,
      platform,
      title: trend.title || `${platform} Trend ${index + 1}`,
      hashtags: trend.hashtags || [],
      sounds: trend.sounds || [],
      engagementScore: trend.engagementScore || Math.floor(Math.random() * 500000),
      viralityIndex: trend.viralityIndex || Math.random(),
      category: trend.category || 'general',
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
      metadata: {
        platform,
        mockData: true,
        generatedAt: new Date().toISOString(),
      },
    }));
  }

  /**
   * Generate mock engagement spikes for a platform
   */
  private async generateMockEngagementSpikes(platform: Platform): Promise<EngagementSpike[]> {
    const spikeCount = Math.floor(Math.random() * 5) + 1;
    const spikes: EngagementSpike[] = [];

    for (let i = 0; i < spikeCount; i++) {
      spikes.push({
        contentId: `${platform}-content-${i + 1}`,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random time in last 24h
        engagementIncrease: Math.floor(Math.random() * 10000) + 1000,
        duration: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
        trigger: ['viral_share', 'influencer_mention', 'algorithm_boost', 'trending_hashtag'][Math.floor(Math.random() * 4)],
      });
    }

    return spikes;
  }

  /**
   * Extract top hashtags from trends
   */
  private extractTopHashtags(trends: Trend[]): string[] {
    const hashtagCounts = new Map<string, number>();
    
    trends.forEach(trend => {
      trend.hashtags.forEach(hashtag => {
        hashtagCounts.set(hashtag, (hashtagCounts.get(hashtag) || 0) + trend.engagementScore);
      });
    });

    return Array.from(hashtagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([hashtag]) => hashtag);
  }

  /**
   * Extract top sounds from trends
   */
  private extractTopSounds(trends: Trend[]): string[] {
    const soundCounts = new Map<string, number>();
    
    trends.forEach(trend => {
      (trend.sounds || []).forEach(sound => {
        soundCounts.set(sound, (soundCounts.get(sound) || 0) + trend.engagementScore);
      });
    });

    return Array.from(soundCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([sound]) => sound);
  }

  /**
   * Generate recommendations for a specific platform
   */
  private async generateRecommendationsForPlatform(signals: PlatformSignals): Promise<TrendAction[]> {
    const recommendations: TrendAction[] = [];

    // Analyze top performing trends
    const topTrends = signals.trends
      .sort((a, b) => b.viralityIndex - a.viralityIndex)
      .slice(0, 5);

    for (const trend of topTrends) {
      const productAlignment = this.calculateProductAlignment(trend);
      const priority = this.determinePriority(trend, productAlignment);
      
      // Create content recommendations
      if (trend.viralityIndex > 0.7) {
        recommendations.push({
          id: `action-${trend.id}-content`,
          type: 'create_content',
          trend,
          priority,
          confidence: Math.min(trend.viralityIndex * productAlignment, 0.95),
          recommendation: `Create ${signals.platform} content leveraging the "${trend.title}" trend`,
          estimatedReach: Math.floor(trend.engagementScore * productAlignment * 0.1),
          productAlignment,
          actionItems: [
            `Research "${trend.title}" trend format and style`,
            `Create content using hashtags: ${trend.hashtags.join(', ')}`,
            ...(trend.sounds?.length ? [`Use trending sound: ${trend.sounds[0]}`] : []),
            'Schedule posting during peak engagement hours',
            'Monitor performance and iterate',
          ],
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        });
      }

      // Hashtag leverage recommendations
      if (trend.hashtags.length > 0 && productAlignment > 0.5) {
        recommendations.push({
          id: `action-${trend.id}-hashtag`,
          type: 'leverage_hashtag',
          trend,
          priority: priority === 'urgent' ? 'high' : priority,
          confidence: productAlignment * 0.8,
          recommendation: `Incorporate trending hashtags into upcoming content`,
          estimatedReach: Math.floor(trend.engagementScore * 0.05),
          productAlignment,
          actionItems: [
            `Use hashtags: ${trend.hashtags.slice(0, 3).join(', ')}`,
            'Create content that naturally incorporates these hashtags',
            'Track hashtag performance metrics',
          ],
        });
      }
    }

    // Engagement spike recommendations
    if (signals.engagementSpikes.length > 2 && topTrends.length > 0) {
      const avgSpike = signals.engagementSpikes.reduce((sum, spike) => sum + spike.engagementIncrease, 0) / signals.engagementSpikes.length;
      
      recommendations.push({
        id: `action-${signals.platform}-timing`,
        type: 'timing_optimization',
        trend: topTrends[0], // Use top trend as reference
        priority: 'medium',
        confidence: 0.75,
        recommendation: `Optimize posting timing based on recent engagement spikes on ${signals.platform}`,
        estimatedReach: Math.floor(avgSpike * 2),
        productAlignment: 0.8,
        actionItems: [
          'Analyze engagement spike patterns',
          'Schedule content during high-engagement windows',
          'A/B test different posting times',
          'Monitor real-time engagement and adjust',
        ],
      });
    }

    return recommendations;
  }

  /**
   * Calculate how well a trend aligns with product types
   */
  private calculateProductAlignment(trend: Trend): number {
    if (this.productTypes.length === 0) return 0.5; // Default alignment if no product types defined

    let maxAlignment = 0;

    for (const product of this.productTypes) {
      let alignment = 0;

      // Check category alignment
      if (product.category.toLowerCase() === trend.category.toLowerCase()) {
        alignment += 0.4;
      }

      // Check keyword alignment
      const trendText = `${trend.title} ${trend.hashtags.join(' ')}`.toLowerCase();
      const matchingKeywords = product.keywords.filter(keyword => 
        trendText.includes(keyword.toLowerCase())
      );
      alignment += (matchingKeywords.length / product.keywords.length) * 0.4;

      // Check demographic alignment (simplified)
      if (product.targetDemographics.some(demo => trendText.includes(demo.toLowerCase()))) {
        alignment += 0.2;
      }

      maxAlignment = Math.max(maxAlignment, alignment);
    }

    return Math.min(maxAlignment, 1.0);
  }

  /**
   * Determine priority based on trend metrics and product alignment
   */
  private determinePriority(trend: Trend, productAlignment: number): TrendAction['priority'] {
    const score = trend.viralityIndex * productAlignment;
    
    if (score > 0.8) return 'urgent';
    if (score > 0.6) return 'high';
    if (score > 0.4) return 'medium';
    return 'low';
  }

  /**
   * Set product types for better trend alignment analysis
   */
  setProductTypes(productTypes: ProductType[]): void {
    this.productTypes = productTypes;
    this.logger.info('Product types updated', { count: productTypes.length });
  }

  /**
   * Get current product types
   */
  getProductTypes(): ProductType[] {
    return [...this.productTypes];
  }
}