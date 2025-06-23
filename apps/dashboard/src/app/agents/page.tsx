'use client';

import { useState, useEffect } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  CogIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  PaintBrushIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowPathIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'idle' | 'maintenance' | 'error';
  lastExecution: string | null;
  performance: {
    successRate: number;
    avgExecutionTime: number;
    totalExecutions: number;
  };
  config: {
    enabled: boolean;
    schedule: string;
    maxConcurrent: number;
  };
  description: string;
  capabilities: string[];
}

const agentIcons = {
  content: DocumentTextIcon,
  ad: MegaphoneIcon,
  outreach: UserGroupIcon,
  trend: ArrowTrendingUpIcon,
  insight: ChartBarIcon,
  design: PaintBrushIcon,
};

const agentColors = {
  content: 'text-blue-400',
  ad: 'text-green-400',
  outreach: 'text-purple-400',
  trend: 'text-orange-400',
  insight: 'text-cyan-400',
  design: 'text-pink-400',
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Mock data for now - will be replaced with real API calls
  useEffect(() => {
    const mockAgents: Agent[] = [
      {
        id: 'content',
        name: 'Content Agent',
        type: 'content',
        status: 'active',
        lastExecution: new Date(Date.now() - 300000).toISOString(),
        performance: {
          successRate: 95.5,
          avgExecutionTime: 2.3,
          totalExecutions: 1247
        },
        config: {
          enabled: true,
          schedule: '0 */2 * * *', // Every 2 hours
          maxConcurrent: 3
        },
        description: 'AI-powered content generation and optimization',
        capabilities: ['Blog Posts', 'Social Media', 'Email Copy', 'SEO Optimization']
      },
      {
        id: 'ad',
        name: 'Ad Agent',
        type: 'ad',
        status: 'active',
        lastExecution: new Date(Date.now() - 180000).toISOString(),
        performance: {
          successRate: 92.1,
          avgExecutionTime: 1.8,
          totalExecutions: 856
        },
        config: {
          enabled: true,
          schedule: '0 */1 * * *', // Every hour
          maxConcurrent: 2
        },
        description: 'Automated ad optimization and bidding',
        capabilities: ['Budget Optimization', 'Audience Targeting', 'Creative Testing', 'Performance Analysis']
      },
      {
        id: 'outreach',
        name: 'Outreach Agent',
        type: 'outreach',
        status: 'idle',
        lastExecution: new Date(Date.now() - 3600000).toISOString(),
        performance: {
          successRate: 88.7,
          avgExecutionTime: 3.1,
          totalExecutions: 432
        },
        config: {
          enabled: false,
          schedule: '0 9 * * 1-5', // Weekdays at 9 AM
          maxConcurrent: 1
        },
        description: 'Lead nurturing and personalized outreach',
        capabilities: ['Email Sequences', 'Lead Scoring', 'Personalization', 'Follow-up Automation']
      },
      {
        id: 'trend',
        name: 'Trend Agent',
        type: 'trend',
        status: 'active',
        lastExecution: new Date(Date.now() - 900000).toISOString(),
        performance: {
          successRate: 97.2,
          avgExecutionTime: 4.5,
          totalExecutions: 723
        },
        config: {
          enabled: true,
          schedule: '0 */6 * * *', // Every 6 hours
          maxConcurrent: 1
        },
        description: 'Market trend analysis and prediction',
        capabilities: ['Hashtag Tracking', 'Competitor Analysis', 'Viral Content Detection', 'Market Insights']
      },
      {
        id: 'insight',
        name: 'Insight Agent',
        type: 'insight',
        status: 'active',
        lastExecution: new Date(Date.now() - 600000).toISOString(),
        performance: {
          successRate: 94.8,
          avgExecutionTime: 2.7,
          totalExecutions: 1891
        },
        config: {
          enabled: true,
          schedule: '0 */4 * * *', // Every 4 hours
          maxConcurrent: 2
        },
        description: 'Performance analytics and insights generation',
        capabilities: ['Performance Reports', 'ROI Analysis', 'Conversion Tracking', 'Predictive Analytics']
      },
      {
        id: 'design',
        name: 'Design Agent',
        type: 'design',
        status: 'maintenance',
        lastExecution: new Date(Date.now() - 7200000).toISOString(),
        performance: {
          successRate: 89.3,
          avgExecutionTime: 5.2,
          totalExecutions: 298
        },
        config: {
          enabled: false,
          schedule: '0 10 * * *', // Daily at 10 AM
          maxConcurrent: 1
        },
        description: 'Automated visual asset creation and optimization',
        capabilities: ['Image Generation', 'Template Creation', 'Brand Consistency', 'A/B Testing Visuals']
      }
    ];

    setTimeout(() => {
      setAgents(mockAgents);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'idle':
        return <ClockIcon className="h-5 w-5 text-yellow-400" />;
      case 'maintenance':
        return <CogIcon className="h-5 w-5 text-blue-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const toggleAgent = (agentId: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { 
            ...agent, 
            status: agent.status === 'active' ? 'idle' : 'active',
            config: { ...agent.config, enabled: agent.status !== 'active' }
          }
        : agent
    ));
  };

  const formatLastExecution = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-dark-700 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-dark-700 rounded-lg"></div>
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
            <h1 className="text-3xl font-bold text-gradient neon-text">AI Agent Control Center</h1>
            <p className="text-dark-400 mt-2">Monitor and manage your AI marketing agents</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="btn-secondary flex items-center space-x-2">
              <ArrowPathIcon className="h-5 w-5" />
              <span>Refresh All</span>
            </button>
            <button className="btn-primary flex items-center space-x-2">
              <PlusIcon className="h-5 w-5" />
              <span>Deploy Agent</span>
            </button>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => {
            const IconComponent = agentIcons[agent.type as keyof typeof agentIcons];
            const iconColor = agentColors[agent.type as keyof typeof agentColors];
            
            return (
              <div key={agent.id} className="card-glow hover:scale-105 transition-transform duration-200">
                {/* Agent Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <IconComponent className={`h-8 w-8 ${iconColor}`} />
                    <div>
                      <h3 className="text-white font-semibold">{agent.name}</h3>
                      <p className="text-dark-400 text-sm">{agent.description}</p>
                    </div>
                  </div>
                  {getStatusIcon(agent.status)}
                </div>

                {/* Performance Metrics */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-dark-400 text-sm">Success Rate</span>
                    <span className="text-white font-medium">{agent.performance.successRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-400 text-sm">Avg. Execution</span>
                    <span className="text-white font-medium">{agent.performance.avgExecutionTime}s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-400 text-sm">Total Runs</span>
                    <span className="text-white font-medium">{agent.performance.totalExecutions.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-400 text-sm">Last Execution</span>
                    <span className="text-white font-medium">{formatLastExecution(agent.lastExecution)}</span>
                  </div>
                </div>

                {/* Capabilities */}
                <div className="mb-4">
                  <p className="text-dark-400 text-xs mb-2">Capabilities</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 3).map((capability) => (
                      <span 
                        key={capability}
                        className="px-2 py-1 bg-dark-700 text-dark-300 text-xs rounded-full"
                      >
                        {capability}
                      </span>
                    ))}
                    {agent.capabilities.length > 3 && (
                      <span className="px-2 py-1 bg-dark-700 text-dark-300 text-xs rounded-full">
                        +{agent.capabilities.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedAgent(agent);
                      setShowConfigModal(true);
                    }}
                    className="btn-secondary text-sm"
                  >
                    Configure
                  </button>
                  <button
                    onClick={() => toggleAgent(agent.id)}
                    className={`btn-pill ${agent.status === 'active' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}
                  >
                    {agent.status === 'active' ? (
                      <PauseIcon className="h-4 w-4" />
                    ) : (
                      <PlayIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Configuration Modal */}
        {showConfigModal && selectedAgent && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-dark-800 border border-dark-700 rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Configure {selectedAgent.name}</h3>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="text-dark-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Status
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      className={`px-3 py-1 rounded text-sm ${
                        selectedAgent.config.enabled 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-dark-700 text-dark-400'
                      }`}
                    >
                      Enabled
                    </button>
                    <button
                      className={`px-3 py-1 rounded text-sm ${
                        !selectedAgent.config.enabled 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-dark-700 text-dark-400'
                      }`}
                    >
                      Disabled
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Schedule (Cron Expression)
                  </label>
                  <input
                    type="text"
                    value={selectedAgent.config.schedule}
                    className="input w-full"
                    placeholder="0 */2 * * *"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Max Concurrent Executions
                  </label>
                  <input
                    type="number"
                    value={selectedAgent.config.maxConcurrent}
                    className="input w-full"
                    min="1"
                    max="10"
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Save configuration
                      setShowConfigModal(false);
                    }}
                    className="btn-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}