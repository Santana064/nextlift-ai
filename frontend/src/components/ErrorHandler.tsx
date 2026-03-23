import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log to error tracking service (if available)
    if (window.errorTracking) {
      window.errorTracking.logError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-2xl p-8 max-w-lg w-full border border-red-500/30 text-center"
          >
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-gray-400 mb-4">{this.state.error?.message || 'An unexpected error occurred'}</p>
            {this.state.errorInfo && (
              <details className="text-left mb-4 p-3 bg-gray-900 rounded-lg overflow-auto max-h-40">
                <summary className="text-red-400 cursor-pointer">Error Details</summary>
                <pre className="text-xs text-gray-400 mt-2 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all"
              >
                Reload Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Network Error Handler
export const handleApiError = (error: any, showToast?: (type: string, message: string) => void) => {
  console.error('API Error:', error);
  
  let message = 'An unexpected error occurred';
  let type = 'error';
  
  if (error.response) {
    // Server responded with error
    const status = error.response.status;
    const data = error.response.data;
    
    if (status === 401) {
      message = 'Your session has expired. Please login again.';
      type = 'warning';
      // Redirect to login after delay
      setTimeout(() => {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }, 2000);
    } else if (status === 403) {
      message = 'You do not have permission to perform this action';
    } else if (status === 404) {
      message = 'Resource not found';
    } else if (status === 500) {
      message = 'Server error. Please try again later.';
    } else {
      message = data?.message || `Error ${status}: ${error.response.statusText}`;
    }
  } else if (error.request) {
    // Request made but no response
    message = 'Cannot connect to server. Please check your internet connection.';
  } else {
    // Something else happened
    message = error.message || 'An error occurred';
  }
  
  if (showToast) {
    showToast(type, message);
  }
  
  return { message, type };
};

// Form Validation Errors
export interface ValidationError {
  field: string;
  message: string;
}

export const validateForm = (data: any, rules: any): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    
    if (rule.required && (!value || value.trim() === '')) {
      errors.push({ field, message: `${field} is required` });
    }
    
    if (rule.minLength && value && value.length < rule.minLength) {
      errors.push({ field, message: `${field} must be at least ${rule.minLength} characters` });
    }
    
    if (rule.maxLength && value && value.length > rule.maxLength) {
      errors.push({ field, message: `${field} must be less than ${rule.maxLength} characters` });
    }
    
    if (rule.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push({ field, message: 'Please enter a valid email address' });
    }
    
    if (rule.pattern && value && !rule.pattern.test(value)) {
      errors.push({ field, message: rule.patternMessage || `${field} is invalid` });
    }
    
    if (rule.match && value !== data[rule.match]) {
      errors.push({ field, message: `${field} does not match` });
    }
    
    if (rule.min && value && value < rule.min) {
      errors.push({ field, message: `${field} must be at least ${rule.min}` });
    }
    
    if (rule.max && value && value > rule.max) {
      errors.push({ field, message: `${field} must be less than ${rule.max}` });
    }
  });
  
  return errors;
};

// Global error tracking (optional)
declare global {
  interface Window {
    errorTracking: {
      logError: (error: Error, errorInfo?: any) => void;
    };
  }
}

// Initialize error tracking
if (typeof window !== 'undefined') {
  window.errorTracking = {
    logError: (error: Error, errorInfo?: any) => {
      // Send to your error tracking service (Sentry, LogRocket, etc.)
      console.log('Error logged:', error, errorInfo);
      
      // Store in localStorage for debugging
      const errors = JSON.parse(localStorage.getItem('error_log') || '[]');
      errors.push({
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        info: errorInfo
      });
      localStorage.setItem('error_log', JSON.stringify(errors.slice(-10))); // Keep last 10 errors
    }
  };
}

// Global unhandled rejection handler
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    window.errorTracking?.logError(event.reason);
  });
  
  window.addEventListener('error', (event) => {
    console.error('Global Error:', event.error);
    window.errorTracking?.logError(event.error);
  });
}
