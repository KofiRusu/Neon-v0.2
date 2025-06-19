/**
 * Example usage of InsightAgent
 * This demonstrates how to initialize and use the InsightAgent for campaign monitoring
 */

import { InsightAgent } from './insight-agent';
import type { AgentContext } from './types';

// Example usage function
export async function exampleInsightAgentUsage() {
  // Create agent context
  const context: AgentContext = {
    logger: {
      info: (msg, meta) => console.log(`INFO: ${msg}`, meta),
      warn: (msg, meta) => console.warn(`WARN: ${msg}`, meta),
      error: (msg, meta) => console.error(`ERROR: ${msg}`, meta),
      debug: (msg, meta) => console.debug(`DEBUG: ${msg}`, meta)
    },
    config: {
      environment: 'development',
      enableLogging: true,
      enableMetrics: true,
      thresholds: {
        ctr: 0.02,  // 2% CTR warning threshold
        cpa: 75,    // $75 CPA warning threshold
        roi: 0.25,  // 25% ROI warning threshold
        roas: 2.0   // 2.0 ROAS warning threshold
      }
    }
  };

  // Custom performance thresholds
  const customThresholds = {
    ctr: {
      warning: 0.015,  // 1.5%
      critical: 0.008  // 0.8%
    },
    cpa: {
      warning: 80,     // $80
      critical: 120    // $120
    }
  };

  // Initialize InsightAgent
  const insightAgent = new InsightAgent(context, customThresholds);
  
  try {
    // Initialize the agent
    await insightAgent.initialize();
    
    console.log('InsightAgent initialized successfully!');
    
    // Example campaign ID
    const campaignId = 'campaign_123';
    
    // Analyze campaign performance
    console.log('\n=== Analyzing Campaign Performance ===');
    const analysisResult = await insightAgent.analyzeCampaignPerformance(campaignId);
    
    if (analysisResult.success) {
      const analysis = analysisResult.data;
      console.log('Analysis Summary:');
      console.log(`- Total Impressions: ${analysis.summary.totalImpressions}`);
      console.log(`- Total Clicks: ${analysis.summary.totalClicks}`);
      console.log(`- Total Conversions: ${analysis.summary.totalConversions}`);
      console.log(`- Total Spend: $${analysis.summary.totalSpend.toFixed(2)}`);
      console.log(`- Total Revenue: $${analysis.summary.totalRevenue.toFixed(2)}`);
      console.log(`- Average CTR: ${(analysis.summary.avgCtr * 100).toFixed(2)}%`);
      console.log(`- Average CPA: $${analysis.summary.avgCpa.toFixed(2)}`);
      console.log(`- ROI: ${(analysis.summary.roi * 100).toFixed(1)}%`);
      console.log(`- ROAS: ${analysis.summary.roas.toFixed(2)}`);
      console.log(`- Insights Found: ${analysis.insights.length}`);
      console.log(`- Anomalies Detected: ${analysis.anomalies.length}`);
      
      // Display insights
      if (analysis.insights.length > 0) {
        console.log('\n=== Campaign Insights ===');
        analysis.insights.forEach((insight, index) => {
          console.log(`${index + 1}. ${insight.title} (${insight.severity})`);
          console.log(`   Description: ${insight.description}`);
          console.log(`   Recommendation: ${insight.recommendation}`);
          console.log(`   Action Items: ${insight.actionItems.join(', ')}`);
        });
      }
      
      // Display anomalies
      if (analysis.anomalies.length > 0) {
        console.log('\n=== Performance Anomalies ===');
        analysis.anomalies.forEach((anomaly, index) => {
          console.log(`${index + 1}. ${anomaly.metric} anomaly (${anomaly.severity})`);
          console.log(`   Current: ${anomaly.currentValue.toFixed(4)}`);
          console.log(`   Expected: ${anomaly.expectedValue.toFixed(4)}`);
          console.log(`   Description: ${anomaly.description}`);
        });
      }
    } else {
      console.error('Analysis failed:', analysisResult.error);
    }
    
    // Get optimization recommendations
    console.log('\n=== Optimization Recommendations ===');
    const recommendationsResult = await insightAgent.recommendOptimization(campaignId);
    
    if (recommendationsResult.success) {
      const recommendations = recommendationsResult.data;
      console.log(`Found ${recommendations.length} recommendations:`);
      
      recommendations.forEach((rec, index) => {
        console.log(`\n${index + 1}. ${rec.title} (${rec.priority} priority)`);
        console.log(`   Type: ${rec.type}`);
        console.log(`   Description: ${rec.description}`);
        console.log(`   Expected Impact: ${rec.expectedImpact}`);
        console.log(`   Effort: ${rec.estimatedEffort}`);
        console.log(`   Action Items:`);
        rec.actionItems.forEach(item => console.log(`     - ${item}`));
      });
    } else {
      console.error('Recommendations failed:', recommendationsResult.error);
    }
    
    // Get campaign health score
    console.log('\n=== Campaign Health Score ===');
    const healthResult = await insightAgent.getCampaignHealthScore(campaignId);
    
    if (healthResult.success) {
      const health = healthResult.data;
      console.log(`Overall Health Score: ${health.overall}/100`);
      console.log(`Trend: ${health.trend}`);
      console.log('Breakdown:');
      console.log(`  - CTR Score: ${health.breakdown.ctr}/25`);
      console.log(`  - CPA Score: ${health.breakdown.cpa}/25`);
      console.log(`  - ROI Score: ${health.breakdown.roi}/25`);
      console.log(`  - Spend Score: ${health.breakdown.spend}/25`);
    } else {
      console.error('Health score failed:', healthResult.error);
    }
    
  } catch (error) {
    console.error('Error using InsightAgent:', error);
  } finally {
    // Clean up
    await insightAgent.shutdown();
    console.log('\nInsightAgent shut down successfully.');
  }
}

/**
 * Example of how to create sample campaign metrics for testing
 */
export function createSampleMetrics(campaignId: string) {
  const now = new Date();
  const metrics = [];
  
  // Generate sample metrics for the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    
    // Simulate different performance scenarios
    let impressions, clicks, conversions, spend, revenue;
    
    if (i < 2) {
      // Recent poor performance
      impressions = 800 + Math.random() * 200;
      clicks = impressions * (0.005 + Math.random() * 0.005); // Low CTR: 0.5-1%
      conversions = clicks * (0.01 + Math.random() * 0.02); // Low conversion rate
      spend = clicks * (3 + Math.random() * 2); // High CPC
      revenue = conversions * (20 + Math.random() * 30); // Variable revenue
    } else {
      // Normal performance
      impressions = 1000 + Math.random() * 500;
      clicks = impressions * (0.015 + Math.random() * 0.01); // Normal CTR: 1.5-2.5%
      conversions = clicks * (0.03 + Math.random() * 0.02); // Normal conversion rate
      spend = clicks * (1.5 + Math.random() * 1); // Normal CPC
      revenue = conversions * (40 + Math.random() * 20); // Normal revenue
    }
    
    metrics.push({
      campaignId,
      timestamp: date,
      impressions: Math.round(impressions),
      clicks: Math.round(clicks),
      conversions: Math.round(conversions),
      spend: Math.round(spend * 100) / 100,
      revenue: Math.round(revenue * 100) / 100,
      ctr: clicks / impressions,
      cpc: spend / clicks,
      cpa: spend / conversions,
      roi: (revenue - spend) / spend,
      roas: revenue / spend
    });
  }
  
  return metrics;
}

// Export for testing
export { InsightAgent };

// Example of how to run this
if (require.main === module) {
  exampleInsightAgentUsage().catch(console.error);
}