'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    revenueChange: number;
    totalImpressions: number;
    impressionsChange: number;
    conversionRate: number;
    conversionChange: number;
    averageROI: number;
    roiChange: number;
  };
  chartData: {
    revenue: Array<{ date: string; value: number }>;
    impressions: Array<{ date: string; value: number }>;
    conversions: Array<{ date: string; value: number }>;
    roi: Array<{ date: string; value: number }>;
  };
  campaignPerformance: Array<{
    id: string;
    name: string;
    type: string;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    roi: number;
  }>;
  agentPerformance: Array<{
    id: string;
    name: string;
    tasksCompleted: number;
    successRate: number;
    impact: number;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [selectedChart, setSelectedChart] = useState('line');

  // Mock data for now - will be replaced with real API calls
  useEffect(() => {
    const mockData: AnalyticsData = {
      overview: {
        totalRevenue: 125789,
        revenueChange: 12.5,
        totalImpressions: 2456789,
        impressionsChange: -3.2,
        conversionRate: 3.8,
        conversionChange: 0.5,
        averageROI: 3.4,
        roiChange: 8.1
      },
      chartData: {
        revenue: [
          { date: '2024-01-01', value: 8500 },
          { date: '2024-01-02', value: 9200 },
          { date: '2024-01-03', value: 7800 },
          { date: '2024-01-04', value: 10500 },
          { date: '2024-01-05', value: 12000 },
          { date: '2024-01-06', value: 11200 },
          { date: '2024-01-07', value: 13500 }
        ],
        impressions: [
          { date: '2024-01-01', value: 285000 },
          { date: '2024-01-02', value: 320000 },
          { date: '2024-01-03', value: 295000 },
          { date: '2024-01-04', value: 410000 },
          { date: '2024-01-05', value: 380000 },
          { date: '2024-01-06', value: 425000 },
          { date: '2024-01-07', value: 465000 }
        ],
        conversions: [
          { date: '2024-01-01', value: 45 },
          { date: '2024-01-02', value: 52 },
          { date: '2024-01-03', value: 38 },
          { date: '2024-01-04', value: 68 },
          { date: '2024-01-05', value: 72 },
          { date: '2024-01-06', value: 59 },
          { date: '2024-01-07', value: 81 }
        ],
        roi: [
          { date: '2024-01-01', value: 2.8 },
          { date: '2024-01-02', value: 3.1 },
          { date: '2024-01-03', value: 2.9 },
          { date: '2024-01-04', value: 3.5 },
          { date: '2024-01-05', value: 3.8 },
          { date: '2024-01-06', value: 3.4 },
          { date: '2024-01-07', value: 4.2 }
        ],
      },
      campaignPerformance: [
        {
          id: 'campaign-1',
          name: 'Summer Neon Collection',
          type: 'Social Media',
          impressions: 125000,
          clicks: 5200,
          conversions: 340,
          revenue: 45000,
          roi: 3.2
        },
        {
          id: 'campaign-2',
          name: 'B2B Outreach Q3',
          type: 'Email',
          impressions: 15000,
          clicks: 1200,
          conversions: 85,
          revenue: 18500,
          roi: 4.1
        },
        {
          id: 'campaign-3',
          name: 'Product Launch - NeonHub Pro',
          type: 'Ads',
          impressions: 89000,
          clicks: 3400,
          conversions: 120,
          revenue: 28000,
          roi: 2.8
        }
      ],
      agentPerformance: [
        {
          id: 'content',
          name: 'Content Agent',
          tasksCompleted: 1247,
          successRate: 95.5,
          impact: 8.2
        },
        {
          id: 'ad',
          name: 'Ad Agent',
          tasksCompleted: 856,
          successRate: 92.1,
          impact: 7.8
        },
        {
          id: 'insight',
          name: 'Insight Agent',
          tasksCompleted: 1891,
          successRate: 94.8,
          impact: 9.1
        },
        {
          id: 'trend',
          name: 'Trend Agent',
          tasksCompleted: 723,
          successRate: 97.2,
          impact: 7.5
        }
      ]
    };

    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1500);
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const formatPercentage = (num: number): string => {
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  // Simple line chart component (in production, you'd use a proper charting library)
  const SimpleLineChart = ({ data, color = 'neon-400' }: { data: Array<{ date: string; value: number }>, color?: string }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue;
    
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * 300;
      const y = 100 - ((point.value - minValue) / range) * 80;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative h-24 w-full">
        <svg className="w-full h-full" viewBox="0 0 300 100">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            points={points}
            className={`text-${color}`}
          />
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 300;
            const y = 100 - ((point.value - minValue) / range) * 80;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="currentColor"
                className={`text-${color}`}
              />
            );
          })}
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-dark-700 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-dark-700 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-dark-700 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-dark-700 rounded-lg"></div>
              <div className="h-64 bg-dark-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!data) return null;

  return (
    <main className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient neon-text">Analytics Dashboard</h1>
            <p className="text-dark-400 mt-2">Track performance across campaigns and AI agents</p>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              className="input w-32"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="24h">Last 24h</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button className="btn-secondary flex items-center space-x-2">
              <DocumentArrowDownIcon className="h-5 w-5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="metric-card">
            <div className="flex items-center justify-between mb-4">
              <CurrencyDollarIcon className="h-8 w-8 text-green-400" />
              <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                data.overview.revenueChange >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {formatPercentage(data.overview.revenueChange)}
              </div>
            </div>
            <div>
              <p className="text-dark-400 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-white neon-text">{formatCurrency(data.overview.totalRevenue)}</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between mb-4">
              <EyeIcon className="h-8 w-8 text-blue-400" />
              <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                data.overview.impressionsChange >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {formatPercentage(data.overview.impressionsChange)}
              </div>
            </div>
            <div>
              <p className="text-dark-400 text-sm font-medium">Total Impressions</p>
              <p className="text-3xl font-bold text-white neon-text">{formatNumber(data.overview.totalImpressions)}</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between mb-4">
              <ArrowTrendingUpIcon className="h-8 w-8 text-purple-400" />
              <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                data.overview.conversionChange >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {formatPercentage(data.overview.conversionChange)}
              </div>
            </div>
            <div>
              <p className="text-dark-400 text-sm font-medium">Conversion Rate</p>
              <p className="text-3xl font-bold text-white neon-text">{data.overview.conversionRate}%</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between mb-4">
              <ChartBarIcon className="h-8 w-8 text-neon-400" />
              <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                data.overview.roiChange >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {formatPercentage(data.overview.roiChange)}
              </div>
            </div>
            <div>
              <p className="text-dark-400 text-sm font-medium">Average ROI</p>
              <p className="text-3xl font-bold text-white neon-text">{data.overview.averageROI}x</p>
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="card-glow mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Performance Trends</h2>
            <div className="flex items-center space-x-4">
              <select 
                className="input w-40"
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
              >
                <option value="revenue">Revenue</option>
                <option value="impressions">Impressions</option>
                <option value="conversions">Conversions</option>
                <option value="roi">ROI</option>
              </select>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedChart('line')}
                  className={`px-3 py-1 rounded text-sm ${selectedChart === 'line' ? 'bg-neon-400/20 text-neon-400' : 'bg-dark-700 text-dark-400'}`}
                >
                  Line
                </button>
                <button
                  onClick={() => setSelectedChart('bar')}
                  className={`px-3 py-1 rounded text-sm ${selectedChart === 'bar' ? 'bg-neon-400/20 text-neon-400' : 'bg-dark-700 text-dark-400'}`}
                >
                  Bar
                </button>
              </div>
            </div>
          </div>
          
          <div className="h-64 flex items-center justify-center">
            {data.chartData[selectedMetric as keyof typeof data.chartData] && (
              <SimpleLineChart 
                data={data.chartData[selectedMetric as keyof typeof data.chartData]}
                color="neon-400"
              />
            )}
          </div>
        </div>

        {/* Campaign Performance & Agent Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Campaign Performance */}
          <div className="card-glow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Campaign Performance</h2>
              <button className="text-neon-400 hover:text-neon-300 text-sm font-medium">View All</button>
            </div>
            <div className="space-y-4">
              {data.campaignPerformance.map((campaign) => (
                <div key={campaign.id} className="activity-item">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-white font-medium">{campaign.name}</h4>
                      <p className="text-dark-400 text-sm">{campaign.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{formatCurrency(campaign.revenue)}</p>
                      <p className={`text-sm ${campaign.roi >= 3 ? 'text-green-400' : campaign.roi >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {campaign.roi}x ROI
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-dark-400">Impressions</p>
                      <p className="text-white font-medium">{formatNumber(campaign.impressions)}</p>
                    </div>
                    <div>
                      <p className="text-dark-400">Clicks</p>
                      <p className="text-white font-medium">{formatNumber(campaign.clicks)}</p>
                    </div>
                    <div>
                      <p className="text-dark-400">Conversions</p>
                      <p className="text-white font-medium">{campaign.conversions}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Performance */}
          <div className="card-glow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">AI Agent Performance</h2>
              <button className="text-neon-400 hover:text-neon-300 text-sm font-medium">Manage Agents</button>
            </div>
            <div className="space-y-4">
              {data.agentPerformance.map((agent) => (
                <div key={agent.id} className="activity-item">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <SparklesIcon className="h-6 w-6 text-neon-400" />
                      <div>
                        <h4 className="text-white font-medium">{agent.name}</h4>
                        <p className="text-dark-400 text-sm">{agent.tasksCompleted} tasks completed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-neon-400 font-semibold">{agent.successRate}%</p>
                      <p className="text-dark-400 text-sm">Success Rate</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-dark-400 text-xs">Impact Score</span>
                        <span className="text-white text-xs font-medium">{agent.impact}/10</span>
                      </div>
                      <div className="w-full bg-dark-700 rounded-full h-2">
                        <div 
                          className="bg-neon-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(agent.impact / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="mt-8 card-glow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">AI-Generated Insights</h2>
            <div className="flex items-center space-x-2 text-dark-400">
              <ClockIcon className="h-4 w-4" />
              <span className="text-sm">Updated 5 minutes ago</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-dark-700/30 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <ArrowTrendingUpIcon className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-medium">Opportunity</span>
              </div>
              <p className="text-dark-300 text-sm">
                Your B2B email campaigns are performing 23% above industry average. Consider increasing budget allocation.
              </p>
            </div>
            <div className="bg-dark-700/30 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">Optimization</span>
              </div>
              <p className="text-dark-300 text-sm">
                Content Agent suggests focusing on video content for 15% higher engagement rates this quarter.
              </p>
            </div>
            <div className="bg-dark-700/30 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <SparklesIcon className="h-5 w-5 text-blue-400" />
                <span className="text-blue-400 font-medium">Trend Alert</span>
              </div>
              <p className="text-dark-300 text-sm">
                Trend Agent detected rising interest in "AI automation" keywords. Perfect timing for your next campaign.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}