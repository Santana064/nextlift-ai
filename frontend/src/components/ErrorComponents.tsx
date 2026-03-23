import React from 'react';
import { motion } from 'framer-motion';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-red-500/10 border border-red-500/30 rounded-xl p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <p className="text-red-400 font-medium">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

interface FieldErrorProps {
  error?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <motion.p
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="text-sm text-red-400 mt-1"
    >
      {error}
    </motion.p>
  );
};

interface LoadingErrorProps {
  message?: string;
  onRetry: () => void;
}

export const LoadingError: React.FC<LoadingErrorProps> = ({ 
  message = 'Failed to load data', 
  onRetry 
}) => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">😵</div>
      <p className="text-gray-400 text-lg mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all"
      >
        Try Again
      </button>
    </div>
  );
};

interface EmptyStateProps {
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message, 
  action, 
  icon = '📭' 
}) => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <p className="text-gray-400 text-lg mb-4">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

interface OfflineBannerProps {
  isOnline: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOnline }) => {
  const [show, setShow] = React.useState(!isOnline);
  
  React.useEffect(() => {
    setShow(!isOnline);
    if (!isOnline) {
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);
  
  if (!show) return null;
  
  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -100 }}
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-500/90 text-white px-6 py-3 rounded-full shadow-lg"
    >
      <div className="flex items-center gap-2">
        <span>📡</span>
        <span>You are offline. Some features may be unavailable.</span>
      </div>
    </motion.div>
  );
};

interface ErrorLoggerProps {
  error: Error;
  context?: string;
}

export const ErrorLogger: React.FC<ErrorLoggerProps> = ({ error, context }) => {
  React.useEffect(() => {
    console.error(`Error in ${context || 'unknown context'}:`, error);
    
    if (window.errorTracking) {
      window.errorTracking.logError(error, { context });
    }
    
    // Store in localStorage for debugging
    const errorLog = JSON.parse(localStorage.getItem('error_log') || '[]');
    errorLog.push({
      timestamp: new Date().toISOString(),
      context,
      message: error.message,
      stack: error.stack
    });
    localStorage.setItem('error_log', JSON.stringify(errorLog.slice(-20)));
  }, [error, context]);
  
  return null;
};
