'use client';

import { useState } from 'react';
import { 
  EnvelopeIcon,
  PlusIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ClockIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import EmailComposer from '../../components/email/EmailComposer';
import ScheduleEmailModal from '../../components/email/ScheduleEmailModal';
import DeliveryLogsPanel from '../../components/email/DeliveryLogsPanel';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'COMPLETED';
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  createdAt: Date;
  scheduledAt?: Date;
}

const mockCampaigns: EmailCampaign[] = [
  {
    id: 'campaign_1',
    name: 'Summer Product Launch',
    subject: 'Introducing Our Revolutionary New Product Line!',
    status: 'COMPLETED',
    totalSent: 5420,
    totalDelivered: 5381,
    totalOpened: 3228,
    totalClicked: 645,
    createdAt: new Date('2024-01-15'),
    scheduledAt: new Date('2024-01-16T10:00:00Z'),
  },
  {
    id: 'campaign_2',
    name: 'Weekly Newsletter #47',
    subject: 'This Week in NeonHub: AI Advances & Market Insights',
    status: 'SENT',
    totalSent: 3250,
    totalDelivered: 3198,
    totalOpened: 1920,
    totalClicked: 384,
    createdAt: new Date('2024-01-10'),
    scheduledAt: new Date('2024-01-12T14:00:00Z'),
  },
  {
    id: 'campaign_3',
    name: 'Customer Survey Invitation',
    subject: 'Help Us Improve: Share Your Feedback',
    status: 'SCHEDULED',
    totalSent: 0,
    totalDelivered: 0,
    totalOpened: 0,
    totalClicked: 0,
    createdAt: new Date('2024-01-18'),
    scheduledAt: new Date('2024-01-20T09:00:00Z'),
  },
];

export default function EmailsPage() {
  const [activeTab, setActiveTab] = useState<'composer' | 'campaigns' | 'analytics' | 'logs'>('composer');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [composerData, setComposerData] = useState({
    subject: '',
    content: '',
  });

  const handleSendEmail = (emailData: any) => {
    console.log('Sending email:', emailData);
    // In real app, would call tRPC endpoint
    alert('Email sent successfully! (Demo)');
  };

  const handleScheduleEmail = (emailData: any, scheduleAt: Date) => {
    setComposerData({
      subject: emailData.subject,
      content: emailData.content,
    });
    setShowScheduleModal(true);
  };

  const handleSaveEmail = (emailData: any) => {
    console.log('Saving email draft:', emailData);
    alert('Email draft saved! (Demo)');
  };

  const handleScheduleConfirm = (scheduleData: any) => {
    console.log('Scheduling email:', scheduleData);
    setShowScheduleModal(false);
    alert('Email scheduled successfully! (Demo)');
  };

  const getStatusConfig = (status: EmailCampaign['status']) => {
    const configs = {
      DRAFT: { color: 'text-gray-400', bg: 'bg-gray-400/20', label: 'Draft' },
      SCHEDULED: { color: 'text-blue-400', bg: 'bg-blue-400/20', label: 'Scheduled' },
      SENDING: { color: 'text-yellow-400', bg: 'bg-yellow-400/20', label: 'Sending' },
      SENT: { color: 'text-green-400', bg: 'bg-green-400/20', label: 'Sent' },
      COMPLETED: { color: 'text-neon-400', bg: 'bg-neon-400/20', label: 'Completed' },
    };
    return configs[status];
  };

  const calculateEngagementRate = (campaign: EmailCampaign) => {
    if (campaign.totalDelivered === 0) return 0;
    return ((campaign.totalOpened / campaign.totalDelivered) * 100);
  };

  const calculateClickRate = (campaign: EmailCampaign) => {
    if (campaign.totalOpened === 0) return 0;
    return ((campaign.totalClicked / campaign.totalOpened) * 100);
  };

  return (
    <div className="min-h-screen bg-dark-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <EnvelopeIcon className="h-8 w-8 text-neon-400 animate-glow" />
              <div className="absolute inset-0 bg-neon-400 rounded-full blur-sm opacity-30 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient neon-text">Email Marketing</h1>
              <p className="text-dark-400">AI-powered email campaigns with advanced targeting</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="btn-secondary flex items-center space-x-2">
              <Cog6ToothIcon className="h-5 w-5" />
              <span>Settings</span>
            </button>
            <button className="btn-primary flex items-center space-x-2">
              <PlusIcon className="h-5 w-5" />
              <span>New Campaign</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6">
          <nav className="flex space-x-1 bg-dark-800/50 rounded-lg p-1">
            {[
              { key: 'composer', label: 'Composer', icon: DocumentTextIcon },
              { key: 'campaigns', label: 'Campaigns', icon: UsersIcon },
              { key: 'analytics', label: 'Analytics', icon: ChartBarIcon },
              { key: 'logs', label: 'Delivery Logs', icon: ClockIcon },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                  activeTab === tab.key
                    ? 'bg-neon-400/20 text-neon-400 font-medium'
                    : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'composer' && (
          <EmailComposer
            onSend={handleSendEmail}
            onSchedule={handleScheduleEmail}
            onSave={handleSaveEmail}
          />
        )}

        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            {/* Campaign Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="metric-card">
                <div className="flex items-center justify-between mb-4">
                  <EnvelopeIcon className="h-8 w-8 text-blue-400" />
                  <div className="text-sm font-medium px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                    Total
                  </div>
                </div>
                <div>
                  <p className="text-dark-400 text-sm font-medium">Campaigns</p>
                  <p className="text-3xl font-bold text-white neon-text">{mockCampaigns.length}</p>
                </div>
              </div>

              <div className="metric-card">
                <div className="flex items-center justify-between mb-4">
                  <UsersIcon className="h-8 w-8 text-green-400" />
                  <div className="text-sm font-medium px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                    +12%
                  </div>
                </div>
                <div>
                  <p className="text-dark-400 text-sm font-medium">Total Sent</p>
                  <p className="text-3xl font-bold text-white neon-text">
                    {mockCampaigns.reduce((sum, c) => sum + c.totalSent, 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="metric-card">
                <div className="flex items-center justify-between mb-4">
                  <ChartBarIcon className="h-8 w-8 text-purple-400" />
                  <div className="text-sm font-medium px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                    +5.2%
                  </div>
                </div>
                <div>
                  <p className="text-dark-400 text-sm font-medium">Avg. Open Rate</p>
                  <p className="text-3xl font-bold text-white neon-text">
                    {(mockCampaigns.reduce((sum, c) => sum + calculateEngagementRate(c), 0) / mockCampaigns.length).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="metric-card">
                <div className="flex items-center justify-between mb-4">
                  <ClockIcon className="h-8 w-8 text-neon-400" />
                  <div className="text-sm font-medium px-2 py-1 rounded-full bg-neon-500/20 text-neon-400">
                    +3.1%
                  </div>
                </div>
                <div>
                  <p className="text-dark-400 text-sm font-medium">Avg. Click Rate</p>
                  <p className="text-3xl font-bold text-white neon-text">
                    {(mockCampaigns.reduce((sum, c) => sum + calculateClickRate(c), 0) / mockCampaigns.length).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Campaigns List */}
            <div className="card-glow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Recent Campaigns</h2>
                <button className="text-neon-400 hover:text-neon-300 text-sm font-medium">View All</button>
              </div>
              
              <div className="space-y-4">
                {mockCampaigns.map((campaign) => {
                  const statusConfig = getStatusConfig(campaign.status);
                  return (
                    <div key={campaign.id} className="agent-card cursor-pointer" onClick={() => setSelectedCampaign(campaign)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-white font-medium">{campaign.name}</h3>
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                              {statusConfig.label}
                            </div>
                          </div>
                          <p className="text-dark-300 text-sm mb-3">{campaign.subject}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-dark-400">Sent</p>
                              <p className="text-white font-medium">{campaign.totalSent.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-dark-400">Delivered</p>
                              <p className="text-green-400 font-medium">{campaign.totalDelivered.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-dark-400">Opened</p>
                              <p className="text-purple-400 font-medium">{campaign.totalOpened.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-dark-400">Clicked</p>
                              <p className="text-neon-400 font-medium">{campaign.totalClicked.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-dark-400 text-sm">Created</p>
                          <p className="text-white text-sm">{campaign.createdAt.toLocaleDateString()}</p>
                          {campaign.scheduledAt && (
                            <>
                              <p className="text-dark-400 text-sm mt-1">Scheduled</p>
                              <p className="text-blue-400 text-sm">{campaign.scheduledAt.toLocaleDateString()}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="card-glow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Email Analytics</h2>
              <button className="btn-secondary">Export Report</button>
            </div>
            <div className="text-center py-12">
              <ChartBarIcon className="h-16 w-16 text-dark-600 mx-auto mb-4" />
              <p className="text-dark-400 text-lg">Advanced analytics dashboard coming soon...</p>
              <p className="text-dark-500 text-sm mt-2">Track engagement metrics, conversion rates, and ROI</p>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <DeliveryLogsPanel campaignId={selectedCampaign?.id} />
        )}
      </div>

      {/* Schedule Email Modal */}
      <ScheduleEmailModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSchedule={handleScheduleConfirm}
        emailData={composerData}
      />
    </div>
  );
}