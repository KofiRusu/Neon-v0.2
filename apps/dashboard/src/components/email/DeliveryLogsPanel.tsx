'use client';

import { useState, useEffect } from 'react';
import { 
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface DeliveryLogsPanelProps {
  campaignId?: string;
  refreshInterval?: number;
}

interface EmailLog {
  id: string;
  recipientEmail: string;
  recipientName?: string;
  status: EmailStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  unsubscribedAt?: Date;
  error?: string;
  provider: 'SENDGRID' | 'MAILGUN' | 'SMTP';
  externalId?: string;
  retryCount?: number;
}

type EmailStatus = 'PENDING' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'BOUNCED' | 'FAILED' | 'UNSUBSCRIBED';

interface FilterOptions {
  status?: EmailStatus;
  dateRange?: 'today' | 'week' | 'month' | 'all';
  search?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

// Mock data for demonstration
const generateMockLogs = (count: number): EmailLog[] => {
  const statuses: EmailStatus[] = ['DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'SENT', 'FAILED'];
  const providers: ('SENDGRID' | 'MAILGUN' | 'SMTP')[] = ['SENDGRID', 'MAILGUN', 'SMTP'];
  
  return Array.from({ length: count }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const sentAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    
    return {
      id: `log_${i + 1}`,
      recipientEmail: `user${i + 1}@example.com`,
      recipientName: Math.random() > 0.5 ? `User ${i + 1}` : undefined,
      status,
      sentAt,
      deliveredAt: status === 'DELIVERED' || status === 'OPENED' || status === 'CLICKED' ? 
        new Date(sentAt.getTime() + Math.random() * 60 * 60 * 1000) : undefined,
      openedAt: status === 'OPENED' || status === 'CLICKED' ? 
        new Date(sentAt.getTime() + Math.random() * 2 * 60 * 60 * 1000) : undefined,
      clickedAt: status === 'CLICKED' ? 
        new Date(sentAt.getTime() + Math.random() * 3 * 60 * 60 * 1000) : undefined,
      bouncedAt: status === 'BOUNCED' ? sentAt : undefined,
      error: status === 'FAILED' || status === 'BOUNCED' ? 
        ['Invalid email address', 'Mailbox full', 'Domain not found', 'Spam filter rejection'][Math.floor(Math.random() * 4)] : undefined,
      provider: providers[Math.floor(Math.random() * providers.length)],
      externalId: `ext_${Date.now()}_${i}`,
      retryCount: status === 'FAILED' ? Math.floor(Math.random() * 3) : 0,
    };
  });
};

const getStatusConfig = (status: EmailStatus) => {
  const configs = {
    PENDING: { color: 'text-yellow-400', bg: 'bg-yellow-400/20', icon: ClockIcon, label: 'Pending' },
    QUEUED: { color: 'text-blue-400', bg: 'bg-blue-400/20', icon: ClockIcon, label: 'Queued' },
    SENT: { color: 'text-cyan-400', bg: 'bg-cyan-400/20', icon: EnvelopeIcon, label: 'Sent' },
    DELIVERED: { color: 'text-green-400', bg: 'bg-green-400/20', icon: CheckCircleIcon, label: 'Delivered' },
    OPENED: { color: 'text-purple-400', bg: 'bg-purple-400/20', icon: EyeIcon, label: 'Opened' },
    CLICKED: { color: 'text-neon-400', bg: 'bg-neon-400/20', icon: CursorArrowRaysIcon, label: 'Clicked' },
    BOUNCED: { color: 'text-orange-400', bg: 'bg-orange-400/20', icon: ExclamationTriangleIcon, label: 'Bounced' },
    FAILED: { color: 'text-red-400', bg: 'bg-red-400/20', icon: XCircleIcon, label: 'Failed' },
    UNSUBSCRIBED: { color: 'text-gray-400', bg: 'bg-gray-400/20', icon: XCircleIcon, label: 'Unsubscribed' },
  };
  return configs[status];
};

export default function DeliveryLogsPanel({ 
  campaignId, 
  refreshInterval = 30000 
}: DeliveryLogsPanelProps) {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 25,
    total: 0,
  });

  // Mock data loading
  useEffect(() => {
    loadLogs();
  }, [campaignId, filters, pagination.page]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(loadLogs, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, campaignId, filters, pagination.page]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let mockLogs = generateMockLogs(250);
      
      // Apply filters
      if (filters.status) {
        mockLogs = mockLogs.filter(log => log.status === filters.status);
      }
      
      if (filters.search) {
        mockLogs = mockLogs.filter(log => 
          log.recipientEmail.toLowerCase().includes(filters.search!.toLowerCase()) ||
          log.recipientName?.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
      
      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        const ranges = {
          today: 1,
          week: 7,
          month: 30,
        };
        const daysBack = ranges[filters.dateRange];
        const cutoff = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
        mockLogs = mockLogs.filter(log => log.sentAt && log.sentAt >= cutoff);
      }
      
      // Pagination
      const total = mockLogs.length;
      const startIndex = (pagination.page - 1) * pagination.limit;
      const paginatedLogs = mockLogs.slice(startIndex, startIndex + pagination.limit);
      
      setLogs(paginatedLogs);
      setPagination(prev => ({ ...prev, total }));
    } catch (error) {
      console.error('Failed to load delivery logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const exportLogs = () => {
    // Mock export functionality
    const csvContent = [
      'Email,Name,Status,Sent At,Delivered At,Opened At,Clicked At,Provider,Error',
      ...logs.map(log => [
        log.recipientEmail,
        log.recipientName || '',
        log.status,
        log.sentAt?.toISOString() || '',
        log.deliveredAt?.toISOString() || '',
        log.openedAt?.toISOString() || '',
        log.clickedAt?.toISOString() || '',
        log.provider,
        log.error || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `email-delivery-logs-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getTotalPages = () => Math.ceil(pagination.total / pagination.limit);

  const getStatusStats = () => {
    const stats: Record<EmailStatus, number> = {
      PENDING: 0, QUEUED: 0, SENT: 0, DELIVERED: 0, OPENED: 0, CLICKED: 0, BOUNCED: 0, FAILED: 0, UNSUBSCRIBED: 0
    };
    
    logs.forEach(log => {
      stats[log.status]++;
    });
    
    return stats;
  };

  const statusStats = getStatusStats();

  return (
    <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl border border-dark-700/50 overflow-hidden">
      {/* Header */}
      <div className="bg-dark-800/80 px-6 py-4 border-b border-dark-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <EnvelopeIcon className="h-6 w-6 text-neon-400" />
            <h2 className="text-xl font-semibold text-white">Delivery Logs</h2>
            {campaignId && (
              <span className="text-dark-400 text-sm">Campaign: {campaignId}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center space-x-2 ${showFilters ? 'bg-neon-400/20 text-neon-400' : ''}`}
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filters</span>
            </button>
            
            <button
              onClick={exportLogs}
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>Export</span>
            </button>
            
            <button
              onClick={loadLogs}
              disabled={loading}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              <span className={loading ? 'animate-spin' : ''}>↻</span>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-dark-700/30 px-6 py-4 border-b border-dark-700/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange({ status: e.target.value as EmailStatus || undefined })}
                className="w-full bg-dark-600/50 border border-dark-500/50 rounded-lg px-3 py-2 text-white text-sm focus:border-neon-400 focus:ring-1 focus:ring-neon-400"
              >
                <option value="">All Statuses</option>
                <option value="DELIVERED">Delivered</option>
                <option value="OPENED">Opened</option>
                <option value="CLICKED">Clicked</option>
                <option value="BOUNCED">Bounced</option>
                <option value="FAILED">Failed</option>
                <option value="SENT">Sent</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Date Range</label>
              <select
                value={filters.dateRange || 'all'}
                onChange={(e) => handleFilterChange({ dateRange: e.target.value as any })}
                className="w-full bg-dark-600/50 border border-dark-500/50 rounded-lg px-3 py-2 text-white text-sm focus:border-neon-400 focus:ring-1 focus:ring-neon-400"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Search</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                  placeholder="Search emails..."
                  className="w-full bg-dark-600/50 border border-dark-500/50 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:border-neon-400 focus:ring-1 focus:ring-neon-400 placeholder-dark-400"
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({});
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="btn-secondary text-sm w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Overview */}
      <div className="px-6 py-4 border-b border-dark-700/50">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(statusStats).filter(([_, count]) => count > 0).map(([status, count]) => {
            const config = getStatusConfig(status as EmailStatus);
            return (
              <div key={status} className="text-center">
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${config.bg} mb-2`}>
                  <config.icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <p className="text-white font-semibold">{count}</p>
                <p className="text-dark-400 text-xs">{config.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                Recipient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                Timeline
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                Provider
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700/50">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-neon-400"></div>
                    <span className="text-dark-400">Loading logs...</span>
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-dark-400">
                  No delivery logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const statusConfig = getStatusConfig(log.status);
                return (
                  <tr key={log.id} className="hover:bg-dark-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{log.recipientEmail}</p>
                        {log.recipientName && (
                          <p className="text-dark-400 text-sm">{log.recipientName}</p>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                          <statusConfig.icon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </div>
                      </div>
                      {log.error && (
                        <p className="text-red-400 text-xs mt-1">{log.error}</p>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        {log.sentAt && (
                          <div className="flex items-center space-x-2 text-dark-300">
                            <EnvelopeIcon className="h-3 w-3" />
                            <span>Sent: {log.sentAt.toLocaleString()}</span>
                          </div>
                        )}
                        {log.deliveredAt && (
                          <div className="flex items-center space-x-2 text-green-400">
                            <CheckCircleIcon className="h-3 w-3" />
                            <span>Delivered: {log.deliveredAt.toLocaleString()}</span>
                          </div>
                        )}
                        {log.openedAt && (
                          <div className="flex items-center space-x-2 text-purple-400">
                            <EyeIcon className="h-3 w-3" />
                            <span>Opened: {log.openedAt.toLocaleString()}</span>
                          </div>
                        )}
                        {log.clickedAt && (
                          <div className="flex items-center space-x-2 text-neon-400">
                            <CursorArrowRaysIcon className="h-3 w-3" />
                            <span>Clicked: {log.clickedAt.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-white">{log.provider}</p>
                        {log.externalId && (
                          <p className="text-dark-400 text-xs font-mono">{log.externalId}</p>
                        )}
                                                 {(log.retryCount ?? 0) > 0 && (
                           <p className="text-orange-400 text-xs">Retries: {log.retryCount}</p>
                         )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <button className="text-neon-400 hover:text-neon-300 text-sm">
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="bg-dark-700/30 px-6 py-4 border-t border-dark-700/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-dark-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                <span>Previous</span>
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, getTotalPages()) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        pagination.page === page
                          ? 'bg-neon-400/20 text-neon-400 font-medium'
                          : 'text-dark-300 hover:text-white hover:bg-dark-600/50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === getTotalPages()}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}