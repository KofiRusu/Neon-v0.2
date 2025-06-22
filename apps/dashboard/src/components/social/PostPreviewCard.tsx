'use client';

import { useState } from 'react';
import { 
  EllipsisVerticalIcon,
  CalendarIcon,
  ChartBarIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ArrowPathRoundedSquareIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { 
  TwitterIcon, 
  InstagramIcon, 
  LinkedInIcon,
  FacebookIcon
} from '../icons/SocialIcons';

interface PostPreviewCardProps {
  post: {
    id: string;
    content: string;
    title?: string;
    platforms: string[];
    status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED' | 'CANCELLED';
    scheduledAt?: Date;
    publishedAt?: Date;
    hashtags?: string[];
    mentions?: string[];
    mediaUrls?: string[];
    engagementData?: {
      likes: number;
      comments: number;
      shares: number;
      views?: number;
    };
    platformPostIds?: Record<string, string>;
  };
  onEdit: (post: any) => void;
  onDelete: (postId: string) => void;
  onPublishNow: (postId: string) => void;
  onViewStats: (postId: string) => void;
}

const platformIcons = {
  TWITTER: TwitterIcon,
  INSTAGRAM: InstagramIcon,
  LINKEDIN: LinkedInIcon,
  FACEBOOK: FacebookIcon,
};

const platformColors = {
  TWITTER: 'text-blue-400',
  INSTAGRAM: 'text-pink-400',
  LINKEDIN: 'text-blue-600',
  FACEBOOK: 'text-blue-500',
};

const statusConfig = {
  DRAFT: {
    color: 'text-gray-400',
    bgColor: 'bg-gray-400/10',
    icon: PencilIcon,
    label: 'Draft',
  },
  SCHEDULED: {
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    icon: ClockIcon,
    label: 'Scheduled',
  },
  PUBLISHING: {
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    icon: ArrowPathRoundedSquareIcon,
    label: 'Publishing',
  },
  PUBLISHED: {
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    icon: CheckCircleIcon,
    label: 'Published',
  },
  FAILED: {
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    icon: ExclamationCircleIcon,
    label: 'Failed',
  },
  CANCELLED: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    icon: XCircleIcon,
    label: 'Cancelled',
  },
};

export default function PostPreviewCard({ 
  post, 
  onEdit, 
  onDelete, 
  onPublishNow, 
  onViewStats 
}: PostPreviewCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const statusInfo = statusConfig[post.status];
  const StatusIcon = statusInfo.icon;

  // Format engagement numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Get engagement rate
  const getEngagementRate = () => {
    if (!post.engagementData) return 0;
    const { likes, comments, shares, views } = post.engagementData;
    const totalEngagement = likes + comments + shares;
    const totalViews = views || totalEngagement * 10; // Mock calculation
    return totalViews > 0 ? ((totalEngagement / totalViews) * 100).toFixed(1) : '0';
  };

  // Truncate content for preview
  const previewContent = post.content.length > 150 && !isExpanded 
    ? post.content.substring(0, 150) + '...' 
    : post.content;

  return (
    <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 hover:border-dark-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Platform Icons */}
          <div className="flex items-center space-x-1">
            {post.platforms.map((platform) => {
              const Icon = platformIcons[platform as keyof typeof platformIcons];
              const color = platformColors[platform as keyof typeof platformColors];
              return Icon ? (
                <div key={platform} className="relative">
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
              ) : null;
            })}
          </div>

          {/* Status Badge */}
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusInfo.label}
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-dark-400 hover:text-white transition-colors"
          >
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-dark-900 border border-dark-700 rounded-lg shadow-lg z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    onEdit(post);
                    setShowMenu(false);
                  }}
                  className="flex items-center px-3 py-2 text-sm text-white hover:bg-dark-800 w-full text-left"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Post
                </button>
                
                {post.status === 'SCHEDULED' && (
                  <button
                    onClick={() => {
                      onPublishNow(post.id);
                      setShowMenu(false);
                    }}
                    className="flex items-center px-3 py-2 text-sm text-green-400 hover:bg-dark-800 w-full text-left"
                  >
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Publish Now
                  </button>
                )}

                {post.status === 'PUBLISHED' && (
                  <>
                    <button
                      onClick={() => {
                        onViewStats(post.id);
                        setShowMenu(false);
                      }}
                      className="flex items-center px-3 py-2 text-sm text-blue-400 hover:bg-dark-800 w-full text-left"
                    >
                      <ChartBarIcon className="h-4 w-4 mr-2" />
                      View Analytics
                    </button>
                    
                    {post.platformPostIds && (
                      <button
                        onClick={() => {
                          // Open first platform post URL
                          const firstPlatform = Object.keys(post.platformPostIds!)[0];
                          const postId = post.platformPostIds![firstPlatform];
                          // Mock URL - in real implementation, construct actual platform URLs
                          window.open(`#/post/${postId}`, '_blank');
                          setShowMenu(false);
                        }}
                        className="flex items-center px-3 py-2 text-sm text-white hover:bg-dark-800 w-full text-left"
                      >
                        <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
                        View on Platform
                      </button>
                    )}
                  </>
                )}

                <hr className="border-dark-700 my-1" />
                
                <button
                  onClick={() => {
                    onDelete(post.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center px-3 py-2 text-sm text-red-400 hover:bg-dark-800 w-full text-left"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete Post
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      {post.title && (
        <h3 className="text-white font-medium mb-2">{post.title}</h3>
      )}

      {/* Content */}
      <div className="mb-3">
        <p className="text-dark-300 whitespace-pre-wrap">
          {previewContent}
        </p>
        {post.content.length > 150 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-neon-400 hover:text-neon-300 text-sm mt-1"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* Hashtags and Mentions */}
      {(post.hashtags?.length || post.mentions?.length) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {post.hashtags?.map((hashtag) => (
            <span key={hashtag} className="text-neon-300 text-sm">
              #{hashtag}
            </span>
          ))}
          {post.mentions?.map((mention) => (
            <span key={mention} className="text-cyan-300 text-sm">
              @{mention}
            </span>
          ))}
        </div>
      )}

      {/* Media Preview */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="mb-3">
          <div className="flex space-x-2 overflow-x-auto">
            {post.mediaUrls.slice(0, 3).map((url, index) => (
              <div
                key={index}
                className="w-16 h-16 bg-dark-700 rounded border border-dark-600 flex-shrink-0 flex items-center justify-center"
              >
                <EyeIcon className="h-4 w-4 text-dark-400" />
              </div>
            ))}
            {post.mediaUrls.length > 3 && (
              <div className="w-16 h-16 bg-dark-700 rounded border border-dark-600 flex-shrink-0 flex items-center justify-center">
                <span className="text-dark-400 text-xs">+{post.mediaUrls.length - 3}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4 text-dark-400">
          {/* Timing */}
          <div className="flex items-center space-x-1">
            <CalendarIcon className="h-4 w-4" />
            <span>
              {post.status === 'PUBLISHED' && post.publishedAt 
                ? `Published ${post.publishedAt.toLocaleDateString()}`
                : post.scheduledAt 
                ? `Scheduled for ${post.scheduledAt.toLocaleDateString()}`
                : 'Draft'
              }
            </span>
          </div>
        </div>

        {/* Engagement Stats */}
        {post.status === 'PUBLISHED' && post.engagementData && (
          <div className="flex items-center space-x-4 text-dark-400">
            <div className="flex items-center space-x-1">
              <HeartIcon className="h-4 w-4" />
              <span>{formatNumber(post.engagementData.likes)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ChatBubbleLeftIcon className="h-4 w-4" />
              <span>{formatNumber(post.engagementData.comments)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ArrowPathRoundedSquareIcon className="h-4 w-4" />
              <span>{formatNumber(post.engagementData.shares)}</span>
            </div>
            <div className="text-neon-400 font-medium">
              {getEngagementRate()}% rate
            </div>
          </div>
        )}
      </div>

      {/* Click away handler for menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}