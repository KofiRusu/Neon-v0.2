'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MessageComposerProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageComposer({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type your message..." 
}: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  return (
    <div className="p-4 border-t border-gray-700 bg-gray-800">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
          isFocused 
            ? 'ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/25' 
            : 'ring-1 ring-gray-600'
        }`}>
          {/* Neon glow effect */}
          {isFocused && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
          
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={`
              relative z-10 w-full px-4 py-3 pr-16 
              bg-gray-700 text-white placeholder-gray-400
              border-0 outline-none resize-none
              transition-all duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            style={{ minHeight: '50px', maxHeight: '120px' }}
          />
          
          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className={`
              absolute right-2 bottom-2 p-2 rounded-xl 
              transition-all duration-200
              ${message.trim() && !disabled
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
        
        {/* Character Counter */}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span>Press Enter to send, Shift+Enter for new line</span>
          </div>
          <span className={message.length > 1000 ? 'text-red-400' : ''}>
            {message.length}/1000
          </span>
        </div>
      </form>
    </div>
  );
}