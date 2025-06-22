'use client';

import { useState } from 'react';
import { SupportInbox } from '../../components/support/SupportInbox';

interface Message {
  id: string;
  content: string;
  senderType: 'CUSTOMER' | 'AGENT' | 'AI_AGENT' | 'SYSTEM';
  senderName: string;
  aiGenerated?: boolean;
  aiConfidence?: number;
  timestamp: Date;
  messageType?: 'TEXT' | 'SYSTEM_NOTIFICATION';
}

interface Thread {
  id: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  customerName?: string;
  customerEmail?: string;
  isAiAssisted: boolean;
  messages: Message[];
}

export default function SupportPage() {
  const [hasEscalation, setHasEscalation] = useState(false);
  const [thread, setThread] = useState<Thread>({
    id: 'thread_demo',
    subject: 'Help with Account Login',
    status: 'OPEN',
    priority: 'MEDIUM',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    isAiAssisted: true,
    messages: [
      {
        id: 'msg_1',
        content: 'Hi, I\'m having trouble logging into my account. Can you help?',
        senderType: 'CUSTOMER',
        senderName: 'John Doe',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
      },
      {
        id: 'msg_2',
        content: 'Hello! I\'d be happy to help you with your login issue. Let me guide you through some troubleshooting steps. First, have you tried resetting your password recently?',
        senderType: 'AI_AGENT',
        senderName: 'Support AI',
        aiGenerated: true,
        aiConfidence: 0.92,
        timestamp: new Date(Date.now() - 4 * 60 * 1000),
      },
      {
        id: 'msg_3',
        content: 'Yes, I tried that but it didn\'t work. I\'m getting frustrated with this.',
        senderType: 'CUSTOMER',
        senderName: 'John Doe',
        timestamp: new Date(Date.now() - 3 * 60 * 1000),
      },
      {
        id: 'msg_4',
        content: 'I understand your frustration, and I want to make sure you get the help you need. Let me try a different approach. Can you tell me what specific error message you\'re seeing when you try to log in?',
        senderType: 'AI_AGENT',
        senderName: 'Support AI',
        aiGenerated: true,
        aiConfidence: 0.88,
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
      }
    ]
  });

  const handleSendMessage = (content: string) => {
    console.log('Sending message:', content);
    // In a real implementation, we would call the tRPC mutation here
    // trpc.support.chat.mutate({ message: content, threadId: thread.id });
  };

  const handleEscalate = () => {
    setHasEscalation(true);
    setThread(prev => ({
      ...prev,
      status: 'IN_PROGRESS',
      priority: 'HIGH'
    }));
    console.log('Escalating to human agent');
    // In a real implementation:
    // trpc.support.escalate.mutate({ threadId: thread.id, reason: 'CUSTOMER_REQUEST' });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Customer Support</h1>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">AI Assistant Active</span>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">24</div>
                <div className="text-gray-400">Active Threads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">89%</div>
                <div className="text-gray-400">AI Resolution Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">2.3m</div>
                <div className="text-gray-400">Avg Response Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Thread List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Support Threads</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-700 rounded-lg border-l-4 border-blue-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-white">Help with Account Login</p>
                      <p className="text-sm text-gray-400">John Doe</p>
                    </div>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      OPEN
                    </span>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-700 rounded-lg border-l-4 border-yellow-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-white">Billing Question</p>
                      <p className="text-sm text-gray-400">Jane Smith</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                      IN_PROGRESS
                    </span>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-700 rounded-lg border-l-4 border-green-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-white">Feature Request</p>
                      <p className="text-sm text-gray-400">Mike Johnson</p>
                    </div>
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                      RESOLVED
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl border border-gray-700 h-[600px]">
              <SupportInbox
                thread={thread}
                onSendMessage={handleSendMessage}
                onEscalate={handleEscalate}
                hasEscalation={hasEscalation}
                escalationMessage="A human agent has been notified and will join the conversation shortly."
              />
            </div>
          </div>
        </div>

        {/* AI Agent Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <h3 className="text-blue-400 font-medium">Response Time</h3>
            </div>
            <p className="text-2xl font-bold text-white">1.2s</p>
            <p className="text-sm text-gray-400">Average AI response</p>
          </div>

          <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="text-green-400 font-medium">Satisfaction</h3>
            </div>
            <p className="text-2xl font-bold text-white">4.8/5</p>
            <p className="text-sm text-gray-400">Customer rating</p>
          </div>

          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <h3 className="text-purple-400 font-medium">AI Confidence</h3>
            </div>
            <p className="text-2xl font-bold text-white">87%</p>
            <p className="text-sm text-gray-400">Current thread</p>
          </div>

          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <h3 className="text-orange-400 font-medium">Escalations</h3>
            </div>
            <p className="text-2xl font-bold text-white">{hasEscalation ? '1' : '0'}</p>
            <p className="text-sm text-gray-400">Today</p>
          </div>
        </div>
      </div>
    </div>
  );
}