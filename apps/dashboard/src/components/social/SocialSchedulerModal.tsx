'use client';

import { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  CalendarIcon, 
  PhotoIcon, 
  HashtagIcon,
  AtSymbolIcon,
  PaperAirplaneIcon,
  ClockIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { 
  TwitterIcon, 
  InstagramIcon, 
  LinkedInIcon 
} from '../icons/SocialIcons';

interface SocialSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (postData: any) => void;
  onPublish: (postData: any) => void;
}

const platformIcons = {
  TWITTER: TwitterIcon,
  INSTAGRAM: InstagramIcon,
  LINKEDIN: LinkedInIcon,
};

const platformColors = {
  TWITTER: 'text-blue-400 border-blue-400',
  INSTAGRAM: 'text-pink-400 border-pink-400',
  LINKEDIN: 'text-blue-600 border-blue-600',
};

const platformLimits = {
  TWITTER: { chars: 280, media: 4 },
  INSTAGRAM: { chars: 2200, media: 10 },
  LINKEDIN: { chars: 3000, media: 9 },
};

export default function SocialSchedulerModal({ 
  isOpen, 
  onClose, 
  onSchedule, 
  onPublish 
}: SocialSchedulerModalProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['TWITTER']);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [mentions, setMentions] = useState<string[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentHashtag, setCurrentHashtag] = useState('');
  const [currentMention, setCurrentMention] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setContent('');
      setTitle('');
      setHashtags([]);
      setMentions([]);
      setMediaUrls([]);
      setScheduledDate('');
      setScheduledTime('');
      setIsScheduled(false);
      setSelectedPlatforms(['TWITTER']);
    }
  }, [isOpen]);

  // Get character count for selected platforms
  const getCharacterCount = () => {
    if (selectedPlatforms.length === 0) return { current: content.length, max: 280 };
    
    const limits = selectedPlatforms.map(platform => platformLimits[platform as keyof typeof platformLimits]?.chars || 280);
    const minLimit = Math.min(...limits);
    return { current: content.length, max: minLimit };
  };

  const charCount = getCharacterCount();
  const isOverLimit = charCount.current > charCount.max;

  // Platform selection handlers
  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  // Add hashtag
  const addHashtag = () => {
    if (currentHashtag.trim() && !hashtags.includes(currentHashtag.trim())) {
      setHashtags(prev => [...prev, currentHashtag.trim()]);
      setCurrentHashtag('');
    }
  };

  // Add mention
  const addMention = () => {
    if (currentMention.trim() && !mentions.includes(currentMention.trim())) {
      setMentions(prev => [...prev, currentMention.trim()]);
      setCurrentMention('');
    }
  };

  // Remove hashtag
  const removeHashtag = (hashtag: string) => {
    setHashtags(prev => prev.filter(h => h !== hashtag));
  };

  // Remove mention
  const removeMention = (mention: string) => {
    setMentions(prev => prev.filter(m => m !== mention));
  };

  // Handle form submission
  const handleSubmit = async (publishNow: boolean = false) => {
    if (!content.trim() || selectedPlatforms.length === 0 || isOverLimit) return;

    setIsLoading(true);

    const postData = {
      content: content.trim(),
      title: title.trim() || undefined,
      platforms: selectedPlatforms,
      hashtags: hashtags.length > 0 ? hashtags : undefined,
      mentions: mentions.length > 0 ? mentions : undefined,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      scheduledAt: publishNow ? undefined : 
        (scheduledDate && scheduledTime) ? 
          new Date(`${scheduledDate}T${scheduledTime}`) : undefined,
    };

    try {
      if (publishNow) {
        await onPublish(postData);
      } else {
        await onSchedule(postData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to process post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate AI-optimized content
  const generateOptimizedContent = () => {
    // Mock AI optimization - in real implementation, this would call an AI service
    const suggestions = [
      "🚀 Exciting news! Our latest AI-powered marketing tools are now live. Experience the future of automated campaigns with #NeonHub #AIMarketing #Innovation",
      "✨ Transform your social media strategy with our intelligent agents. From content creation to engagement tracking - we've got you covered! #SocialMedia #Automation",
      "🎯 New feature alert! Schedule posts across all platforms with just one click. Say goodbye to manual posting! #ProductUpdate #SocialScheduling #Efficiency"
    ];
    
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    setContent(randomSuggestion);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-800 rounded-xl border border-dark-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-neon-400 to-neon-500 rounded-lg flex items-center justify-center">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Schedule Social Post</h2>
              <p className="text-sm text-dark-400">Create and schedule posts across multiple platforms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Select Platforms
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(platformIcons).map(([platform, Icon]) => (
                <button
                  key={platform}
                  onClick={() => togglePlatform(platform)}
                  className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedPlatforms.includes(platform)
                      ? `${platformColors[platform as keyof typeof platformColors]} bg-opacity-10`
                      : 'border-dark-600 text-dark-400 hover:border-dark-500'
                  }`}
                >
                  <Icon className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">{platform}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Input */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-white">
                Post Content
              </label>
              <button
                onClick={generateOptimizedContent}
                className="text-xs text-neon-400 hover:text-neon-300 flex items-center space-x-1"
              >
                <SparklesIcon className="h-3 w-3" />
                <span>AI Optimize</span>
              </button>
            </div>
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening? Share your thoughts..."
                className={`w-full h-32 p-4 bg-dark-900 border rounded-lg text-white placeholder-dark-400 resize-none ${
                  isOverLimit ? 'border-red-500' : 'border-dark-600 focus:border-neon-400'
                } focus:outline-none focus:ring-2 focus:ring-neon-400/20`}
              />
              <div className={`absolute bottom-3 right-3 text-xs ${
                isOverLimit ? 'text-red-400' : 'text-dark-400'
              }`}>
                {charCount.current}/{charCount.max}
              </div>
            </div>
          </div>

          {/* Title (optional) */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Post Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a catchy title..."
              className="w-full p-3 bg-dark-900 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-neon-400 focus:ring-2 focus:ring-neon-400/20"
            />
          </div>

          {/* Hashtags and Mentions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hashtags */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Hashtags
              </label>
              <div className="flex items-center space-x-2 mb-3">
                <div className="relative flex-1">
                  <HashtagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
                  <input
                    type="text"
                    value={currentHashtag}
                    onChange={(e) => setCurrentHashtag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                    placeholder="trending"
                    className="w-full pl-10 pr-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-neon-400"
                  />
                </div>
                <button
                  onClick={addHashtag}
                  className="px-4 py-2 bg-neon-400 text-dark-900 rounded-lg hover:bg-neon-300 transition-colors font-medium"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {hashtags.map((hashtag) => (
                  <span
                    key={hashtag}
                    className="inline-flex items-center px-3 py-1 bg-dark-700 text-neon-300 rounded-full text-sm"
                  >
                    #{hashtag}
                    <button
                      onClick={() => removeHashtag(hashtag)}
                      className="ml-2 text-dark-400 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Mentions */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Mentions
              </label>
              <div className="flex items-center space-x-2 mb-3">
                <div className="relative flex-1">
                  <AtSymbolIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
                  <input
                    type="text"
                    value={currentMention}
                    onChange={(e) => setCurrentMention(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMention())}
                    placeholder="username"
                    className="w-full pl-10 pr-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-neon-400"
                  />
                </div>
                <button
                  onClick={addMention}
                  className="px-4 py-2 bg-neon-400 text-dark-900 rounded-lg hover:bg-neon-300 transition-colors font-medium"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {mentions.map((mention) => (
                  <span
                    key={mention}
                    className="inline-flex items-center px-3 py-1 bg-dark-700 text-cyan-300 rounded-full text-sm"
                  >
                    @{mention}
                    <button
                      onClick={() => removeMention(mention)}
                      className="ml-2 text-dark-400 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Media Attachments
            </label>
            <div className="border-2 border-dashed border-dark-600 rounded-lg p-6 text-center hover:border-dark-500 transition-colors">
              <PhotoIcon className="h-8 w-8 text-dark-400 mx-auto mb-2" />
              <p className="text-dark-400 text-sm">
                Click to upload images or drag and drop
              </p>
              <p className="text-dark-500 text-xs mt-1">
                Supports: JPG, PNG, GIF, MP4 (Max 10MB)
              </p>
            </div>
          </div>

          {/* Scheduling */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <button
                onClick={() => setIsScheduled(!isScheduled)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  isScheduled 
                    ? 'border-neon-400 text-neon-400 bg-neon-400/10' 
                    : 'border-dark-600 text-dark-400 hover:border-dark-500'
                }`}
              >
                <ClockIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Schedule for later</span>
              </button>
            </div>

            {isScheduled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-neon-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full p-3 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-neon-400"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-dark-700">
          <div className="text-sm text-dark-400">
            Publishing to {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-dark-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            
            {!isScheduled && (
              <button
                onClick={() => handleSubmit(true)}
                disabled={!content.trim() || selectedPlatforms.length === 0 || isOverLimit || isLoading}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <PaperAirplaneIcon className="h-4 w-4" />
                )}
                <span>Publish Now</span>
              </button>
            )}
            
            <button
              onClick={() => handleSubmit(false)}
              disabled={!content.trim() || selectedPlatforms.length === 0 || isOverLimit || isLoading || (isScheduled && (!scheduledDate || !scheduledTime))}
              className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
              ) : (
                <CalendarIcon className="h-4 w-4" />
              )}
              <span>{isScheduled ? 'Schedule Post' : 'Save Draft'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}