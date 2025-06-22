'use client';

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  LinkIcon, 
  FunnelIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ClockIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import SocialSchedulerModal from '../../components/social/SocialSchedulerModal';
import CredentialConnectDrawer from '../../components/social/CredentialConnectDrawer';
import PostPreviewCard from '../../components/social/PostPreviewCard';

// Mock data - in real implementation, this would come from tRPC
const mockPosts = [
  {
    id: 'post-1',
    content: '🚀 Exciting news! Our latest AI-powered marketing tools are now live. Experience the future of automated campaigns with NeonHub! #AIMarketing #Innovation #NeonHub',
    title: 'Product Launch Announcement',
    platforms: ['TWITTER', 'LINKEDIN'],
    status: 'PUBLISHED' as const,
    publishedAt: new Date('2024-01-15'),
    hashtags: ['AIMarketing', 'Innovation', 'NeonHub'],
    mentions: [],
    engagementData: {
      likes: 156,
      comments: 23,
      shares: 12,
      views: 1240,
    },
    platformPostIds: {
      TWITTER: 'tw_1234567890',
      LINKEDIN: 'li_0987654321',
    },
  },
  {
    id: 'post-2',
    content: '✨ Transform your social media strategy with our intelligent agents. From content creation to engagement tracking - we\'ve got you covered!',
    platforms: ['INSTAGRAM', 'FACEBOOK'],
    status: 'SCHEDULED' as const,
    scheduledAt: new Date('2024-01-20T14:30:00'),
    hashtags: ['SocialMedia', 'Automation', 'AI'],
    mentions: [],
  },
  {
    id: 'post-3',
    content: 'Behind the scenes at NeonHub 🎨 Our team is working on something amazing...',
    platforms: ['INSTAGRAM'],
    status: 'DRAFT' as const,
    hashtags: ['BehindTheScenes', 'TeamWork'],
    mentions: [],
    mediaUrls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  },
];

const mockConnections = [
  {
    platform: 'TWITTER',
    accountName: '@neonhub_ai',
    isActive: true,
    connectedAt: new Date('2024-01-01'),
  },
  {
    platform: 'INSTAGRAM',
    accountName: 'neonhub.ai',
    isActive: true,
    connectedAt: new Date('2024-01-01'),
  },
  {
    platform: 'LINKEDIN',
    accountName: 'NeonHub AI',
    isActive: false,
    connectedAt: null,
  },
];

export default function SocialPage() {
  const [posts, setPosts] = useState(mockPosts);
  const [connections, setConnections] = useState(mockConnections);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  // Filter posts based on search and status
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.hashtags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    totalPosts: posts.length,
    scheduled: posts.filter(p => p.status === 'SCHEDULED').length,
    published: posts.filter(p => p.status === 'PUBLISHED').length,
    drafts: posts.filter(p => p.status === 'DRAFT').length,
    totalEngagement: posts
      .filter(p => p.engagementData)
      .reduce((sum, p) => sum + (p.engagementData?.likes || 0) + (p.engagementData?.comments || 0) + (p.engagementData?.shares || 0), 0),
    connectedPlatforms: connections.filter(c => c.isActive).length,
  };

  // Handle post scheduling
  const handleSchedulePost = async (postData: any) => {
    setIsLoading(true);
    try {
      // In real implementation, call tRPC mutation
      // await trpc.social.schedulePost.mutate(postData);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPost = {
        id: `post-${Date.now()}`,
        ...postData,
        status: postData.scheduledAt ? 'SCHEDULED' : 'PUBLISHED',
        publishedAt: postData.scheduledAt ? undefined : new Date(),
      };
      
      setPosts(prev => [newPost, ...prev]);
    } catch (error) {
      console.error('Failed to schedule post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle post publishing
  const handlePublishPost = async (postData: any) => {
    setIsLoading(true);
    try {
      // In real implementation, call tRPC mutation
      // await trpc.social.publishPost.mutate(postData);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newPost = {
        id: `post-${Date.now()}`,
        ...postData,
        status: 'PUBLISHED' as const,
        publishedAt: new Date(),
        engagementData: {
          likes: 0,
          comments: 0,
          shares: 0,
          views: 0,
        },
      };
      
      setPosts(prev => [newPost, ...prev]);
    } catch (error) {
      console.error('Failed to publish post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle platform connection
  const handleConnectPlatform = async (platform: string, credentials: any) => {
    try {
      // In real implementation, call tRPC mutation
      // await trpc.social.connectPlatform.mutate(credentials);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConnections(prev => 
        prev.map(conn => 
          conn.platform === platform 
            ? { ...conn, isActive: true, accountName: credentials.accountInfo.accountName, connectedAt: new Date() }
            : conn
        )
      );
    } catch (error) {
      console.error('Failed to connect platform:', error);
    }
  };

  // Handle post actions
  const handleEditPost = (post: any) => {
    console.log('Edit post:', post);
    // Open scheduler with post data
    setIsSchedulerOpen(true);
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handlePublishNow = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      // In real implementation, call tRPC mutation
      setPosts(prev => 
        prev.map(p => 
          p.id === postId 
            ? { ...p, status: 'PUBLISHED' as const, publishedAt: new Date() }
            : p
        )
      );
    }
  };

  const handleViewStats = (postId: string) => {
    console.log('View stats for post:', postId);
    // Open analytics modal or navigate to analytics page
  };

  return (
    <div className="min-h-screen bg-dark-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Social Media Hub</h1>
            <p className="text-dark-400">Manage your cross-platform social media presence</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsCredentialsOpen(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <LinkIcon className="h-4 w-4" />
              <span>Manage Connections</span>
            </button>
            <button
              onClick={() => setIsSchedulerOpen(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Create Post</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="metric-card">
            <div className="flex items-center justify-between mb-2">
              <SparklesIcon className="h-6 w-6 text-neon-400" />
              <span className="text-xs text-green-400 bg-green-400/20 px-2 py-1 rounded-full">+12%</span>
            </div>
            <p className="text-dark-400 text-sm">Total Posts</p>
            <p className="text-2xl font-bold text-white neon-text">{stats.totalPosts}</p>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between mb-2">
              <ClockIcon className="h-6 w-6 text-blue-400" />
              <span className="text-xs text-blue-400 bg-blue-400/20 px-2 py-1 rounded-full">Active</span>
            </div>
            <p className="text-dark-400 text-sm">Scheduled</p>
            <p className="text-2xl font-bold text-white">{stats.scheduled}</p>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between mb-2">
              <ChartBarIcon className="h-6 w-6 text-green-400" />
              <span className="text-xs text-green-400 bg-green-400/20 px-2 py-1 rounded-full">+24%</span>
            </div>
            <p className="text-dark-400 text-sm">Published</p>
            <p className="text-2xl font-bold text-white">{stats.published}</p>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between mb-2">
              <LinkIcon className="h-6 w-6 text-cyan-400" />
              <span className="text-xs text-cyan-400 bg-cyan-400/20 px-2 py-1 rounded-full">Connected</span>
            </div>
            <p className="text-dark-400 text-sm">Platforms</p>
            <p className="text-2xl font-bold text-white">{stats.connectedPlatforms}/6</p>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between mb-2">
              <ChartBarIcon className="h-6 w-6 text-purple-400" />
              <span className="text-xs text-purple-400 bg-purple-400/20 px-2 py-1 rounded-full">+18%</span>
            </div>
            <p className="text-dark-400 text-sm">Total Engagement</p>
            <p className="text-2xl font-bold text-white">{stats.totalEngagement.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 pr-4 w-64"
              />
            </div>

            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-4 w-4 text-dark-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-400"
              >
                <option value="ALL">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PUBLISHED">Published</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-dark-400">
            {filteredPosts.length} of {posts.length} posts
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <ArrowPathIcon className="h-8 w-8 text-neon-400 animate-spin" />
            <span className="ml-3 text-dark-400">Processing...</span>
          </div>
        )}

        {filteredPosts.length === 0 && !isLoading ? (
          <div className="card-glow text-center py-12">
            <SparklesIcon className="h-12 w-12 text-dark-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No posts found</h3>
            <p className="text-dark-400 mb-6">
              {searchQuery || statusFilter !== 'ALL' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first social media post to get started'
              }
            </p>
            <button
              onClick={() => setIsSchedulerOpen(true)}
              className="btn-primary"
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostPreviewCard
              key={post.id}
              post={post}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
              onPublishNow={handlePublishNow}
              onViewStats={handleViewStats}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <SocialSchedulerModal
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        onSchedule={handleSchedulePost}
        onPublish={handlePublishPost}
      />

      <CredentialConnectDrawer
        isOpen={isCredentialsOpen}
        onClose={() => setIsCredentialsOpen(false)}
        onConnect={handleConnectPlatform}
        connections={connections}
      />
    </div>
  );
}