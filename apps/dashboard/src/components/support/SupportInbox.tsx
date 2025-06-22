'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageComposer } from './MessageComposer';
import { EscalationAlertBanner } from './EscalationAlertBanner';

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

interface SupportInboxProps {
  thread?: Thread;
  onSendMessage?: (message: string) => void;
  onEscalate?: () => void;
  hasEscalation?: boolean;
  escalationMessage?: string;
}

export function SupportInbox({
  thread,
  onSendMessage,
  onEscalate,
  hasEscalation = false,
  escalationMessage
}: SupportInboxProps) {
  const [messages, setMessages] = useState<Message[]>(thread?.messages || []);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      content,
      senderType: 'CUSTOMER',
      senderName: thread?.customerName || 'Customer',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: `msg_${Date.now()}_ai`,
        content: "Thank you for your message. I'm analyzing your request and will provide assistance shortly.",
        senderType: 'AI_AGENT',
        senderName: 'Support AI',
        aiGenerated: true,
        aiConfidence: 0.85,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);

    onSendMessage?.(content);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'from-red-500 to-pink-500';
      case 'HIGH': return 'from-orange-500 to-red-500';
      case 'MEDIUM': return 'from-blue-500 to-cyan-500';
      case 'LOW': return 'from-green-500 to-blue-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getMessageBubbleStyle = (message: Message) => {
    if (message.senderType === 'CUSTOMER') {
      return 'ml-auto bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
    } else if (message.senderType === 'AI_AGENT') {
      return 'mr-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white';
    } else if (message.senderType === 'AGENT') {
      return 'mr-auto bg-gradient-to-r from-green-500 to-teal-500 text-white';
    } else {
      return 'mx-auto bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Thread Header */}
      {thread && (
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{thread.subject}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>Customer: {thread.customerName || 'Anonymous'}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getPriorityColor(thread.priority)}`}>
                  {thread.priority}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  thread.status === 'OPEN' ? 'bg-green-500/20 text-green-400' :
                  thread.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                  thread.status === 'RESOLVED' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {thread.status}
                </span>
                {thread.isAiAssisted && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                    🤖 AI-Assisted
                  </span>
                )}
              </div>
            </div>
            {onEscalate && (
              <button
                onClick={onEscalate}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-orange-500/25"
              >
                Escalate to Human
              </button>
            )}
          </div>
        </div>
      )}

      {/* Escalation Alert */}
      {hasEscalation && (
        <EscalationAlertBanner message={escalationMessage} />
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.senderType === 'CUSTOMER' ? 'justify-end' : 
                message.senderType === 'SYSTEM' ? 'justify-center' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-lg ${getMessageBubbleStyle(message)}`}>
                {/* Sender Info */}
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-medium opacity-80">
                    {message.senderName}
                  </span>
                  {message.aiGenerated && (
                    <div className="flex items-center space-x-1">
                      <span className="text-xs bg-black/20 px-1 rounded">AI</span>
                      {message.aiConfidence && (
                        <span className="text-xs bg-black/20 px-1 rounded">
                          {Math.round(message.aiConfidence * 100)}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Message Content */}
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                {/* Timestamp */}
                <div className="mt-1 text-xs opacity-60">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-2xl shadow-lg max-w-xs">
              <div className="flex items-center space-x-1">
                <span className="text-xs font-medium opacity-80">Support AI</span>
              </div>
              <div className="flex space-x-1 mt-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer */}
      <MessageComposer onSendMessage={handleSendMessage} disabled={isTyping} />
    </div>
  );
}