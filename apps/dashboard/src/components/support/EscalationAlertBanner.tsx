'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EscalationAlertBannerProps {
  message?: string;
  type?: 'warning' | 'error' | 'info';
  onDismiss?: () => void;
  autoHide?: boolean;
  duration?: number;
}

export function EscalationAlertBanner({
  message = "This conversation has been escalated to a human agent.",
  type = 'warning',
  onDismiss,
  autoHide = false,
  duration = 5000
}: EscalationAlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  // Auto-hide functionality
  if (autoHide && duration > 0) {
    setTimeout(() => {
      if (isVisible) {
        handleDismiss();
      }
    }, duration);
  }

  const getAlertStyles = () => {
    switch (type) {
      case 'error':
        return {
          background: 'from-red-500/20 to-pink-500/20',
          border: 'border-red-500/50',
          glow: 'shadow-red-500/25',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'info':
        return {
          background: 'from-blue-500/20 to-cyan-500/20',
          border: 'border-blue-500/50',
          glow: 'shadow-blue-500/25',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )
        };
      default: // warning
        return {
          background: 'from-orange-500/20 to-yellow-500/20',
          border: 'border-orange-500/50',
          glow: 'shadow-orange-500/25',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        };
    }
  };

  const styles = getAlertStyles();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className={`
            relative m-4 p-4 rounded-xl border 
            bg-gradient-to-r ${styles.background} ${styles.border}
            shadow-lg ${styles.glow}
            backdrop-blur-sm
          `}
        >
          {/* Animated background pulse */}
          <motion.div
            className={`absolute inset-0 rounded-xl bg-gradient-to-r ${styles.background}`}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Pulsing Icon */}
              <motion.div
                className="text-white"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {styles.icon}
              </motion.div>
              
              {/* Message */}
              <div>
                <p className="text-white font-medium">Escalation Alert</p>
                <p className="text-gray-200 text-sm">{message}</p>
              </div>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-white text-sm font-medium">
                  Agent Notified
                </span>
              </div>
              
              {/* Dismiss Button */}
              {onDismiss && (
                <button
                  onClick={handleDismiss}
                  className="p-1 text-white hover:text-gray-300 transition-colors duration-200"
                  aria-label="Dismiss alert"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* Progress Bar for Auto-hide */}
          {autoHide && duration > 0 && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-xl"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}