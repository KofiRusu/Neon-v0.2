'use client';

import { useState } from 'react';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  SparklesIcon,
  PlayIcon,
  PauseIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  PaintBrushIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

export default function Dashboard(): JSX.Element {
  const [searchQuery] = useState('');

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
    <main className="flex-1 p-8">
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="card-glow">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gradient mb-2">Welcome back, User!</h1>
                  <p className="text-dark-400">Your AI agents are working hard to optimize your marketing campaigns.</p>
                </div>
                <a href="/campaigns" className="btn-primary flex items-center space-x-2">
                  <PlusIcon className="h-5 w-5" />
                  <span>New Campaign</span>
                </a>
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
                <a href="/agents" className="text-neon-400 hover:text-neon-300 text-sm font-medium">Manage Agents</a>
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
                <a href="/analytics" className="text-neon-400 hover:text-neon-300 text-sm font-medium">View All</a>
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
         </main>
   );
 } 