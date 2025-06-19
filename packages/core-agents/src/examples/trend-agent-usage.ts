/**
 * Example usage of TrendAgent
 * This demonstrates how to use the TrendAgent to scan trends and get recommendations
 */

import { TrendAgent, ProductType } from '../index';
import { Logger } from '../../../types/src/index';

// Simple logger implementation for the example
const logger: Logger = {
  info: (message: string, meta?: Record<string, unknown>) => 
    console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta, null, 2) : ''),
  warn: (message: string, meta?: Record<string, unknown>) => 
    console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta, null, 2) : ''),
  error: (message: string, meta?: Record<string, unknown>) => 
    console.error(`[ERROR] ${message}`, meta ? JSON.stringify(meta, null, 2) : ''),
  debug: (message: string, meta?: Record<string, unknown>) => 
    console.debug(`[DEBUG] ${message}`, meta ? JSON.stringify(meta, null, 2) : ''),
};

// Example product types for better trend alignment
const productTypes: ProductType[] = [
  {
    id: 'tech-gadgets',
    name: 'Tech Gadgets',
    category: 'technology',
    targetDemographics: ['millennials', 'gen-z', 'tech-enthusiasts'],
    keywords: ['tech', 'gadget', 'AI', 'smart', 'digital', 'innovation'],
  },
  {
    id: 'sustainable-fashion',
    name: 'Sustainable Fashion',
    category: 'lifestyle',
    targetDemographics: ['eco-conscious', 'millennials', 'gen-z'],
    keywords: ['sustainable', 'eco-friendly', 'fashion', 'green', 'ethical'],
  },
  {
    id: 'home-decor',
    name: 'Home Decor',
    category: 'home',
    targetDemographics: ['homeowners', 'millennials', 'design-lovers'],
    keywords: ['home', 'decor', 'design', 'interior', 'aesthetic', 'minimalist'],
  },
];

async function demonstrateTrendAgent() {
  console.log('🚀 TrendAgent Demo - Detecting Viral Content Trends\n');

  // Initialize TrendAgent with product types
  const trendAgent = new TrendAgent(logger, productTypes);

  try {
    // Example 1: Scan trends for TikTok
    console.log('📱 Scanning TikTok trends...');
    const tiktokResult = await trendAgent.scanTrends('tiktok');
    
    if (tiktokResult.success) {
      console.log(`✅ Found ${tiktokResult.data.trends.length} TikTok trends`);
      console.log(`📊 Total engagement: ${tiktokResult.data.totalEngagement.toLocaleString()}`);
      console.log(`🏷️ Top hashtags: ${tiktokResult.data.topHashtags.slice(0, 3).join(', ')}\n`);
    } else {
      console.error('❌ Failed to scan TikTok trends:', tiktokResult.error.message);
      return;
    }

    // Example 2: Scan trends for Instagram
    console.log('📸 Scanning Instagram trends...');
    const instagramResult = await trendAgent.scanTrends('instagram');
    
    if (instagramResult.success) {
      console.log(`✅ Found ${instagramResult.data.trends.length} Instagram trends`);
      console.log(`📊 Total engagement: ${instagramResult.data.totalEngagement.toLocaleString()}\n`);
    }

    // Example 3: Get trend action recommendations
    console.log('💡 Generating trend action recommendations...');
    const recommendationsResult = await trendAgent.recommendTrendActions();
    
    if (recommendationsResult.success) {
      const recommendations = recommendationsResult.data;
      console.log(`✅ Generated ${recommendations.length} recommendations\n`);
      
      // Display top 3 recommendations
      console.log('🎯 Top Recommendations:');
      recommendations.slice(0, 3).forEach((rec, index) => {
        console.log(`\n${index + 1}. ${rec.recommendation}`);
        console.log(`   🎯 Type: ${rec.type}`);
        console.log(`   ⚡ Priority: ${rec.priority}`);
        console.log(`   🎯 Confidence: ${(rec.confidence * 100).toFixed(1)}%`);
        console.log(`   📈 Estimated Reach: ${rec.estimatedReach.toLocaleString()}`);
        console.log(`   🔗 Product Alignment: ${(rec.productAlignment * 100).toFixed(1)}%`);
        console.log(`   📋 Action Items: ${rec.actionItems.slice(0, 2).join(', ')}...`);
      });
    } else {
      console.error('❌ Failed to generate recommendations:', recommendationsResult.error.message);
    }

    // Example 4: Scan specific platform with custom handling
    console.log('\n🐦 Scanning Twitter trends with custom handling...');
    const twitterResult = await trendAgent.scanTrends('twitter');
    
    if (twitterResult.success) {
      const signals = twitterResult.data;
      
      // Get recommendations for just this platform
      const platformRecommendations = await trendAgent.recommendTrendActions([signals]);
      
      if (platformRecommendations.success) {
        console.log(`✅ Generated ${platformRecommendations.data.length} Twitter-specific recommendations`);
        
        // Show engagement spikes
        if (signals.engagementSpikes.length > 0) {
          console.log('\n⚡ Recent Engagement Spikes:');
          signals.engagementSpikes.forEach(spike => {
            console.log(`   • ${spike.trigger}: +${spike.engagementIncrease.toLocaleString()} engagement`);
          });
        }
      }
    }

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo
if (require.main === module) {
  demonstrateTrendAgent().catch(console.error);
}

export { demonstrateTrendAgent };