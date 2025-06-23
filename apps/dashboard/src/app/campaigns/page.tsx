'use client';

import { useState, useEffect } from 'react';
import { 
  PlusIcon,
  MegaphoneIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  PlayIcon,
  PauseIcon,
  FunnelIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'social_media' | 'email' | 'ads' | 'content' | 'influencer' | 'event';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  budget: number;
  spent: number;
  roi: number;
  startDate: string;
  endDate: string;
  platforms: string[];
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    leads: number;
  };
  targetAudience: {
    ageRange: string;
    location: string;
    interests: string[];
  };
}

const campaignTypes = {
  social_media: { name: 'Social Media', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  email: { name: 'Email', color: 'text-green-400', bg: 'bg-green-500/20' },
  ads: { name: 'Ads', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  content: { name: 'Content', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  influencer: { name: 'Influencer', color: 'text-pink-400', bg: 'bg-pink-500/20' },
  event: { name: 'Event', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
};

const statusConfig = {
  draft: { name: 'Draft', color: 'text-gray-400', bg: 'bg-gray-500/20', icon: ClockIcon },
  active: { name: 'Active', color: 'text-green-400', bg: 'bg-green-500/20', icon: CheckCircleIcon },
  paused: { name: 'Paused', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: PauseIcon },
  completed: { name: 'Completed', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: CheckCircleIcon },
  cancelled: { name: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/20', icon: ExclamationTriangleIcon },
};

export default function CampaignsPage(): JSX.Element {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [, setSelectedCampaign] = useState<Campaign | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for now - will be replaced with real API calls
  useEffect(() => {
    const mockCampaigns: Campaign[] = [
      {
        id: 'campaign-1',
        name: 'Summer Neon Collection',
        description: 'Promote the new summer collection with vibrant neon themes',
        type: 'social_media',
        status: 'active',
        budget: 5000,
        spent: 3250,
        roi: 3.2,
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        platforms: ['Instagram', 'TikTok', 'Facebook'],
        metrics: {
          impressions: 125000,
          clicks: 5200,
          conversions: 340,
          leads: 180
        },
        targetAudience: {
          ageRange: '18-35',
          location: 'United States',
          interests: ['Fashion', 'Music', 'Art']
        }
      },
      {
        id: 'campaign-2',
        name: 'B2B Outreach Q3',
        description: 'Email campaign targeting enterprise clients',
        type: 'email',
        status: 'active',
        budget: 2000,
        spent: 850,
        roi: 4.1,
        startDate: '2024-07-01',
        endDate: '2024-09-30',
        platforms: ['Email'],
        metrics: {
          impressions: 15000,
          clicks: 1200,
          conversions: 85,
          leads: 45
        },
        targetAudience: {
          ageRange: '25-55',
          location: 'North America',
          interests: ['Business', 'Technology', 'Marketing']
        }
      },
      {
        id: 'campaign-3',
        name: 'Product Launch - NeonHub Pro',
        description: 'Launch campaign for our new premium features',
        type: 'ads',
        status: 'paused',
        budget: 8000,
        spent: 2100,
        roi: 2.8,
        startDate: '2024-05-15',
        endDate: '2024-07-15',
        platforms: ['Google Ads', 'LinkedIn'],
        metrics: {
          impressions: 89000,
          clicks: 3400,
          conversions: 120,
          leads: 95
        },
        targetAudience: {
          ageRange: '28-45',
          location: 'Global',
          interests: ['Marketing', 'AI', 'Automation']
        }
      },
      {
        id: 'campaign-4',
        name: 'Content Marketing Push',
        description: 'Educational content series about AI marketing',
        type: 'content',
        status: 'draft',
        budget: 3000,
        spent: 0,
        roi: 0,
        startDate: '2024-08-01',
        endDate: '2024-10-31',
        platforms: ['Blog', 'YouTube', 'LinkedIn'],
        metrics: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          leads: 0
        },
        targetAudience: {
          ageRange: '25-50',
          location: 'Global',
          interests: ['Marketing', 'Education', 'Technology']
        }
      }
    ];

    setTimeout(() => {
      setCampaigns(mockCampaigns);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    const matchesType = filterType === 'all' || campaign.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const calculateBudgetProgress = (spent: number, budget: number) => {
    return Math.min((spent / budget) * 100, 100);
  };

  const toggleCampaignStatus = (campaignId: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { 
            ...campaign, 
            status: campaign.status === 'active' ? 'paused' : 'active'
          }
        : campaign
    ));
  };

  if (loading) {
    return (
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-dark-700 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-dark-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient neon-text">Campaign Management</h1>
            <p className="text-dark-400 mt-2">Create, manage, and track your marketing campaigns</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>New Campaign</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="card-glow mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  className="input pl-4 pr-4 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <select 
                className="input w-32"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <select 
                className="input w-32"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="social_media">Social Media</option>
                <option value="email">Email</option>
                <option value="ads">Ads</option>
                <option value="content">Content</option>
                <option value="influencer">Influencer</option>
                <option value="event">Event</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2 text-dark-400">
              <FunnelIcon className="h-4 w-4" />
              <span className="text-sm">{filteredCampaigns.length} campaigns</span>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="space-y-6">
          {filteredCampaigns.map((campaign) => {
            const typeConfig = campaignTypes[campaign.type];
            const statusInfo = statusConfig[campaign.status];
            const StatusIcon = statusInfo.icon;
            const budgetProgress = calculateBudgetProgress(campaign.spent, campaign.budget);
            
            return (
              <div key={campaign.id} className="card-glow hover:border-neon-400/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${typeConfig.bg}`}>
                      <MegaphoneIcon className={`h-6 w-6 ${typeConfig.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{campaign.name}</h3>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${statusInfo.bg}`}>
                          <StatusIcon className={`h-3 w-3 ${statusInfo.color}`} />
                          <span className={`text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.name}
                          </span>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${typeConfig.bg} ${typeConfig.color}`}>
                          {typeConfig.name}
                        </div>
                      </div>
                      <p className="text-dark-400 mb-3">{campaign.description}</p>
                      <div className="flex items-center space-x-6 text-sm text-dark-400">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <UserGroupIcon className="h-4 w-4" />
                          <span>{campaign.targetAudience.ageRange}, {campaign.targetAudience.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedCampaign(campaign)}
                      className="btn-secondary text-sm"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="btn-secondary text-sm">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleCampaignStatus(campaign.id)}
                      className={`btn-pill ${campaign.status === 'active' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}
                    >
                      {campaign.status === 'active' ? (
                        <PauseIcon className="h-4 w-4" />
                      ) : (
                        <PlayIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
                  <div className="metric-card">
                    <div className="flex items-center space-x-2 mb-2">
                      <CurrencyDollarIcon className="h-4 w-4 text-green-400" />
                      <span className="text-dark-400 text-xs">Budget</span>
                    </div>
                    <p className="text-white font-semibold">{formatCurrency(campaign.budget)}</p>
                    <div className="w-full bg-dark-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${budgetProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-dark-400 mt-1">
                      {formatCurrency(campaign.spent)} spent ({budgetProgress.toFixed(1)}%)
                    </p>
                  </div>
                  
                  <div className="metric-card">
                    <div className="flex items-center space-x-2 mb-2">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-neon-400" />
                      <span className="text-dark-400 text-xs">ROI</span>
                    </div>
                    <p className="text-white font-semibold">{campaign.roi}x</p>
                    <div className={`flex items-center space-x-1 text-xs ${campaign.roi >= 3 ? 'text-green-400' : campaign.roi >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {campaign.roi >= 3 ? (
                        <ArrowTrendingUpIcon className="h-3 w-3" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-3 w-3" />
                      )}
                      <span>{campaign.roi >= 3 ? 'Excellent' : campaign.roi >= 2 ? 'Good' : 'Poor'}</span>
                    </div>
                  </div>
                  
                  <div className="metric-card">
                    <div className="flex items-center space-x-2 mb-2">
                      <EyeIcon className="h-4 w-4 text-blue-400" />
                      <span className="text-dark-400 text-xs">Impressions</span>
                    </div>
                    <p className="text-white font-semibold">{formatNumber(campaign.metrics.impressions)}</p>
                  </div>
                  
                  <div className="metric-card">
                    <div className="flex items-center space-x-2 mb-2">
                      <ChartBarIcon className="h-4 w-4 text-purple-400" />
                      <span className="text-dark-400 text-xs">Clicks</span>
                    </div>
                    <p className="text-white font-semibold">{formatNumber(campaign.metrics.clicks)}</p>
                  </div>
                  
                  <div className="metric-card">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-400" />
                      <span className="text-dark-400 text-xs">Conversions</span>
                    </div>
                    <p className="text-white font-semibold">{formatNumber(campaign.metrics.conversions)}</p>
                  </div>
                  
                  <div className="metric-card">
                    <div className="flex items-center space-x-2 mb-2">
                      <UserGroupIcon className="h-4 w-4 text-cyan-400" />
                      <span className="text-dark-400 text-xs">Leads</span>
                    </div>
                    <p className="text-white font-semibold">{formatNumber(campaign.metrics.leads)}</p>
                  </div>
                </div>

                {/* Platforms */}
                <div className="flex items-center space-x-2">
                  <span className="text-dark-400 text-sm">Platforms:</span>
                  <div className="flex flex-wrap gap-1">
                    {campaign.platforms.map((platform) => (
                      <span 
                        key={platform}
                        className="px-2 py-1 bg-dark-700 text-dark-300 text-xs rounded-full"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Campaign Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-dark-800 border border-dark-700 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Create New Campaign</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-dark-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Campaign Name
                    </label>
                    <input
                      type="text"
                      className="input w-full"
                      placeholder="Enter campaign name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Campaign Type
                    </label>
                    <select className="input w-full">
                      <option value="">Select type</option>
                      <option value="social_media">Social Media</option>
                      <option value="email">Email</option>
                      <option value="ads">Ads</option>
                      <option value="content">Content</option>
                      <option value="influencer">Influencer</option>
                      <option value="event">Event</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Description
                  </label>
                  <textarea
                    className="input w-full h-24 resize-none"
                    placeholder="Describe your campaign objectives..."
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Budget
                    </label>
                    <input
                      type="number"
                      className="input w-full"
                      placeholder="5000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="input w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="input w-full"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Create Campaign
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}