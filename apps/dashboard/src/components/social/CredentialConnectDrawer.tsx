'use client';

import { useState } from 'react';
import { 
  XMarkIcon, 
  LinkIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { 
  TwitterIcon, 
  InstagramIcon, 
  LinkedInIcon,
  FacebookIcon,
  TikTokIcon,
  YouTubeIcon
} from '../icons/SocialIcons';

interface CredentialConnectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (platform: string, credentials: any) => void;
  connections: Array<{
    platform: string;
    accountName: string;
    isActive: boolean;
    connectedAt: Date | null;
  }>;
}

const platforms = [
  {
    id: 'TWITTER',
    name: 'Twitter',
    icon: TwitterIcon,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    description: 'Post tweets, threads, and engage with your audience',
    permissions: ['Post tweets', 'Read mentions', 'Manage direct messages'],
  },
  {
    id: 'INSTAGRAM',
    name: 'Instagram',
    icon: InstagramIcon,
    color: 'text-pink-400',
    bgColor: 'bg-pink-400/10',
    description: 'Share photos, stories, and reels',
    permissions: ['Post media', 'View insights', 'Manage comments'],
  },
  {
    id: 'LINKEDIN',
    name: 'LinkedIn',
    icon: LinkedInIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10',
    description: 'Professional networking and content sharing',
    permissions: ['Post content', 'Share articles', 'Manage connections'],
  },
  {
    id: 'FACEBOOK',
    name: 'Facebook',
    icon: FacebookIcon,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    description: 'Share updates and manage pages',
    permissions: ['Post content', 'Manage pages', 'View insights'],
  },
  {
    id: 'TIKTOK',
    name: 'TikTok',
    icon: TikTokIcon,
    color: 'text-black dark:text-white',
    bgColor: 'bg-gray-500/10',
    description: 'Create and share short-form videos',
    permissions: ['Upload videos', 'View analytics', 'Manage comments'],
  },
  {
    id: 'YOUTUBE',
    name: 'YouTube',
    icon: YouTubeIcon,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    description: 'Upload videos and manage your channel',
    permissions: ['Upload videos', 'Manage playlists', 'View analytics'],
  },
];

export default function CredentialConnectDrawer({ 
  isOpen, 
  onClose, 
  onConnect, 
  connections 
}: CredentialConnectDrawerProps) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  // Get connection status for a platform
  const getConnectionStatus = (platformId: string) => {
    return connections.find(conn => conn.platform === platformId);
  };

  // Handle platform connection
  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    
    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful connection
      const mockCredentials = {
        platform: platformId,
        authCode: `mock_auth_${Date.now()}`,
        accountInfo: {
          accountId: `${platformId.toLowerCase()}_${Date.now()}`,
          accountName: platformId === 'TWITTER' ? '@neonhub_ai' : 
                      platformId === 'INSTAGRAM' ? 'neonhub.ai' :
                      platformId === 'LINKEDIN' ? 'NeonHub AI' :
                      `NeonHub ${platformId}`,
        },
      };

      await onConnect(platformId, mockCredentials);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setConnecting(null);
    }
  };

  // Handle platform disconnection
  const handleDisconnect = async (platformId: string) => {
    // In a real implementation, this would revoke tokens and remove credentials
    console.log(`Disconnecting from ${platformId}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-dark-800 w-full sm:w-auto sm:min-w-[600px] sm:max-w-4xl sm:rounded-xl border-t sm:border border-dark-700 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-neon-400 to-neon-500 rounded-lg flex items-center justify-center">
              <LinkIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Platform Connections</h2>
              <p className="text-sm text-dark-400">Connect your social media accounts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Connected Accounts Summary */}
          <div className="mb-6 p-4 bg-dark-900 rounded-lg border border-dark-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium mb-1">Connected Platforms</h3>
                <p className="text-dark-400 text-sm">
                  {connections.filter(c => c.isActive).length} of {platforms.length} platforms connected
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="h-5 w-5 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Secure</span>
              </div>
            </div>
          </div>

          {/* Platform List */}
          <div className="space-y-4">
            {platforms.map((platform) => {
              const connection = getConnectionStatus(platform.id);
              const isConnected = connection?.isActive;
              const isConnecting = connecting === platform.id;

              return (
                <div
                  key={platform.id}
                  className="p-4 bg-dark-900 rounded-lg border border-dark-700 hover:border-dark-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 ${platform.bgColor} rounded-lg flex items-center justify-center`}>
                        <platform.icon className={`h-6 w-6 ${platform.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-white font-medium">{platform.name}</h3>
                          {isConnected && (
                            <CheckCircleIcon className="h-4 w-4 text-green-400" />
                          )}
                        </div>
                        <p className="text-dark-400 text-sm mb-2">{platform.description}</p>
                        
                        {isConnected && connection && (
                          <div className="text-xs text-dark-500 mb-2">
                            Connected as <span className="text-neon-400">{connection.accountName}</span>
                            {connection.connectedAt && (
                              <span className="ml-2">
                                on {connection.connectedAt.toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Permissions */}
                        <div className="flex flex-wrap gap-1">
                          {platform.permissions.slice(0, 3).map((permission) => (
                            <span
                              key={permission}
                              className="px-2 py-1 bg-dark-800 text-dark-300 text-xs rounded"
                            >
                              {permission}
                            </span>
                          ))}
                          {platform.permissions.length > 3 && (
                            <span className="px-2 py-1 bg-dark-800 text-dark-300 text-xs rounded">
                              +{platform.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex flex-col items-end space-y-2">
                      {isConnected ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDisconnect(platform.id)}
                            className="text-red-400 hover:text-red-300 text-sm font-medium"
                          >
                            Disconnect
                          </button>
                          <button
                            onClick={() => handleConnect(platform.id)}
                            className="text-neon-400 hover:text-neon-300 text-sm font-medium"
                          >
                            Reconnect
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConnect(platform.id)}
                          disabled={isConnecting}
                          className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                        >
                          {isConnecting ? (
                            <>
                              <ArrowPathIcon className="h-4 w-4 animate-spin" />
                              <span>Connecting...</span>
                            </>
                          ) : (
                            <>
                              <LinkIcon className="h-4 w-4" />
                              <span>Connect</span>
                            </>
                          )}
                        </button>
                      )}
                      
                      {/* Status indicator */}
                      <div className="flex items-center space-x-1 text-xs">
                        <div className={`w-2 h-2 rounded-full ${
                          isConnected ? 'bg-green-400' : 'bg-gray-500'
                        }`} />
                        <span className={isConnected ? 'text-green-400' : 'text-gray-500'}>
                          {isConnected ? 'Connected' : 'Not connected'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {selectedPlatform === platform.id && (
                    <div className="mt-4 pt-4 border-t border-dark-700">
                      <h4 className="text-white font-medium mb-2">Permissions Required:</h4>
                      <div className="space-y-1">
                        {platform.permissions.map((permission) => (
                          <div key={permission} className="flex items-center space-x-2 text-sm">
                            <CheckCircleIcon className="h-4 w-4 text-green-400" />
                            <span className="text-dark-300">{permission}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <ShieldCheckIcon className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-blue-400 font-medium mb-1">Security & Privacy</h4>
                <p className="text-blue-300 text-sm">
                  Your credentials are encrypted and stored securely. We only request the minimum permissions needed for posting and analytics.
                </p>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 p-4 bg-dark-900 rounded-lg border border-dark-700">
            <h4 className="text-white font-medium mb-2 flex items-center">
              <GlobeAltIcon className="h-4 w-4 mr-2" />
              Need Help?
            </h4>
            <div className="space-y-2 text-sm text-dark-400">
              <p>• Make sure you're logged into your social media accounts</p>
              <p>• Grant all requested permissions for full functionality</p>
              <p>• You can disconnect and reconnect at any time</p>
              <p>• Contact support if you encounter any issues</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-dark-700">
          <div className="text-sm text-dark-400">
            Manage your social media connections
          </div>
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}