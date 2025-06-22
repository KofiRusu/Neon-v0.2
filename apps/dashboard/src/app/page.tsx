'use client';

import { useState } from 'react';
import { 
  ChartBarIcon, 
  CogIcon, 
  UserGroupIcon, 
  SparklesIcon,
  PlayIcon,
  PauseIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  PaintBrushIcon,
  BellIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const agents = [
    { id: 'content', name: 'Content Agent', status: 'active', icon: DocumentTextIcon, color: 'text-blue-400', description: 'AI-powered content generation' },
    { id: 'ad', name: 'Ad Agent', status: 'active', icon: MegaphoneIcon, color: 'text-green-400', description: 'Automated ad optimization' },
    { id: 'outreach', name: 'Outreach Agent', status: 'idle', icon: UserGroupIcon, color: 'text-purple-400', description: 'Lead nurturing & engagement' },
    { id: 'trend', name: 'Trend Agent', status: 'active', icon: ArrowTrendingUpIcon, color: 'text-orange-400', description: 'Market trend analysis' },
    { id: 'insight', name: 'Insight Agent', status: 'active', icon: ChartBarIcon, color: 'text-cyan-400', description: 'Performance analytics' },
    { id: 'design', name: 'Design Agent', status: 'idle', icon: PaintBrushIcon, color: 'text-pink-400', description: 'Visual asset creation' },
  ];

  const metrics = [
    { name: 'Total Campaigns', value: '12', change: '+2', changeType: 'positive', icon: MegaphoneIcon, color: 'text-blue-400' },
    { name: 'Active Agents', value: '4', change: '+1', changeType: 'positive', icon: SparklesIcon, color: 'text-green-400' },
    { name: 'ROI', value: '3.2x', change: '+0.3x', changeType: 'positive', icon: ChartBarIcon, color: 'text-cyan-400' },
    { name: 'Leads Generated', value: '1,247', change: '+156', changeType: 'positive', icon: UserGroupIcon, color: 'text-purple-400' },
  ];

  const recentActivity = [
    { id: 1, agent: 'Content Agent', action: 'Generated 5 Instagram posts', time: '2 minutes ago', status: 'completed', type: 'content' },
    { id: 2, agent: 'Ad Agent', action: 'Optimized Facebook ad budget', time: '5 minutes ago', status: 'completed', type: 'ads' },
    { id: 3, agent: 'Trend Agent', action: 'Detected viral hashtag trend', time: '8 minutes ago', status: 'completed', type: 'trends' },
    { id: 4, agent: 'Outreach Agent', action: 'Sent 25 personalized emails', time: '12 minutes ago', status: 'completed', type: 'outreach' },
  ];

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="bg-dark-800/80 backdrop-blur-md border-b border-dark-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <SparklesIcon className="h-8 w-8 text-neon-400 animate-glow" />
                  <div className="absolute inset-0 bg-neon-400 rounded-full blur-sm opacity-30 animate-pulse"></div>
                </div>
                <h1 className="text-2xl font-bold text-gradient neon-text">NeonHub AI</h1>
              </div>
              <span className="text-dark-400 hidden md:block">Marketing Ecosystem</span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search agents, campaigns..."
                  className="input pl-10 pr-4 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Notifications */}
              <button className="btn-secondary relative">
                <BellIcon className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-neon-400 rounded-full animate-pulse"></span>
              </button>
              
              {/* Settings */}
              <button className="btn-secondary">
                <CogIcon className="h-5 w-5" />
              </button>
              
              {/* User Avatar */}
              <div className="w-10 h-10 bg-gradient-to-r from-neon-400 to-neon-500 rounded-full flex items-center justify-center neon-glow">
                <span className="text-white font-medium">N</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 sidebar min-h-screen sticky top-20">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`nav-item w-full ${activeTab === 'overview' ? 'active' : ''}`}
            >
              <ChartBarIcon className="h-5 w-5 mr-3" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`nav-item w-full ${activeTab === 'agents' ? 'active' : ''}`}
            >
              <SparklesIcon className="h-5 w-5 mr-3" />
              AI Agents
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`nav-item w-full ${activeTab === 'campaigns' ? 'active' : ''}`}
            >
              <MegaphoneIcon className="h-5 w-5 mr-3" />
              Campaigns
            </button>
            <a
              href="/emails"
              className="nav-item w-full flex items-center"
            >
              <EnvelopeIcon className="h-5 w-5 mr-3" />
              Email Marketing
            </a>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`nav-item w-full ${activeTab === 'analytics' ? 'active' : ''}`}
            >
              <ArrowTrendingUpIcon className="h-5 w-5 mr-3" />
              Analytics
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="card-glow">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gradient mb-2">Welcome back, User!</h1>
                    <p className="text-dark-400">Your AI agents are working hard to optimize your marketing campaigns.</p>
                  </div>
                  <button className="btn-primary flex items-center space-x-2">
                    <PlusIcon className="h-5 w-5" />
                    <span>New Campaign</span>
                  </button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric) => (
                  <div key={metric.name} className="metric-card">
                    <div className="flex items-center justify-between mb-4">
                      <metric.icon className={`h-8 w-8 ${metric.color}`} />
                      <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                        metric.changeType === 'positive' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {metric.change}
                      </div>
                    </div>
                    <div>
                      <p className="text-dark-400 text-sm font-medium">{metric.name}</p>
                      <p className="text-3xl font-bold text-white neon-text">{metric.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Agents Status */}
              <div className="card-glow">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">AI Agents Status</h2>
                  <div className="flex items-center space-x-2">
                    <FunnelIcon className="h-4 w-4 text-dark-400" />
                    <span className="text-dark-400 text-sm">Filter</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAgents.map((agent) => (
                    <div key={agent.id} className="agent-card">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <agent.icon className={`h-8 w-8 ${agent.color}`} />
                          <div>
                            <h3 className="text-white font-medium">{agent.name}</h3>
                            <p className="text-dark-400 text-xs">{agent.description}</p>
                          </div>
                        </div>
                        <div className={`status-indicator ${agent.status}`}></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-dark-400 text-sm capitalize">{agent.status}</span>
                        <button className="btn-pill">
                          {agent.status === 'active' ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card-glow">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
                  <button className="text-neon-400 hover:text-neon-300 text-sm font-medium">View All</button>
                </div>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-neon-400 rounded-full animate-pulse"></div>
                          <div>
                            <p className="text-white font-medium">{activity.agent}</p>
                            <p className="text-dark-400 text-sm">{activity.action}</p>
                          </div>
                        </div>
                        <span className="text-dark-400 text-sm">{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="card-glow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">AI Agent Control Center</h2>
                <button className="btn-primary">Deploy New Agent</button>
              </div>
              <p className="text-dark-400">Advanced agent management interface coming soon...</p>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="card-glow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Campaign Management</h2>
                <button className="btn-primary">Create Campaign</button>
              </div>
              <p className="text-dark-400">Campaign orchestration interface coming soon...</p>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="card-glow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Analytics Dashboard</h2>
                <button className="btn-secondary">Export Report</button>
              </div>
              <p className="text-dark-400">Advanced analytics and reporting coming soon...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 