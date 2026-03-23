import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraGuidanceProps {
  message: string;
  type: 'error' | 'warning' | 'info' | 'success' | null;
  isActive: boolean;
}

const CameraGuidance: React.FC<CameraGuidanceProps> = ({ message, type, isActive }) => {
  if (!isActive || !message) return null;

  const getStyles = () => {
    switch(type) {
      case 'error':
        return {
          bg: 'bg-red-600/95', // Much brighter and more opaque
          border: 'border-red-400',
          text: 'text-white font-bold',
          icon: '⚠️',
          shadow: 'shadow-lg shadow-red-500/50'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/95', // Brighter yellow
          border: 'border-yellow-300',
          text: 'text-white font-bold',
          icon: '⚡',
          shadow: 'shadow-lg shadow-yellow-500/50'
        };
      case 'success':
        return {
          bg: 'bg-green-600/95', // Brighter green
          border: 'border-green-400',
          text: 'text-white font-bold',
          icon: '✅',
          shadow: 'shadow-lg shadow-green-500/50'
        };
      case 'info':
        return {
          bg: 'bg-blue-600/95', // Brighter blue
          border: 'border-blue-400',
          text: 'text-white font-bold',
          icon: '💡',
          shadow: 'shadow-lg shadow-blue-500/50'
        };
      default:
        return {
          bg: 'bg-gray-800/95',
          border: 'border-gray-600',
          text: 'text-white font-bold',
          icon: '🔔',
          shadow: 'shadow-lg shadow-gray-500/50'
        };
    }
  };

  const styles = getStyles();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={message + type}
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50
          max-w-md w-full mx-4 ${styles.shadow}`}
      >
        <div className={`
          ${styles.bg} backdrop-blur-sm
          border-2 ${styles.border}
          rounded-2xl p-5
          flex items-start gap-4
        `}>
          <span className="text-3xl filter drop-shadow-lg">{styles.icon}</span>
          <div className="flex-1">
            <p className={`${styles.text} text-lg tracking-wide`}>
              {message}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CameraGuidance;
