import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';

const Test: React.FC = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const testEndpoint = async (name: string, url: string, method = 'GET', body = null) => {
    setLoading(prev => ({ ...prev, [name]: true }));
    try {
      const response = await api({ method, url, data: body });
      setResults(prev => ({ 
        ...prev, 
        [name]: { success: true, data: response.data }
      }));
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [name]: { success: false, error: error.message }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold neon-text mb-6">API Test Dashboard</h1>

        <div className="grid gap-4">
          <TestCard 
            name="Health Check"
            endpoint="/health"
            onTest={() => testEndpoint('health', '/health')}
            result={results.health}
            loading={loading.health}
          />

          <TestCard 
            name="Auth Login"
            endpoint="/auth/login"
            method="POST"
            onTest={() => testEndpoint('login', '/auth/login', 'POST', {
              email: 'demo@nextlift.ai',
              password: 'demo123'
            })}
            result={results.login}
            loading={loading.login}
          />

          <TestCard 
            name="Get Workouts"
            endpoint="/workouts"
            onTest={() => testEndpoint('workouts', '/workouts')}
            result={results.workouts}
            loading={loading.workouts}
          />

          <TestCard 
            name="Analytics Dashboard"
            endpoint="/analytics/dashboard"
            onTest={() => testEndpoint('analytics', '/analytics/dashboard')}
            result={results.analytics}
            loading={loading.analytics}
          />
        </div>
      </div>
    </div>
  );
};

const TestCard = ({ name, endpoint, method = 'GET', onTest, result, loading }) => (
  <motion.div 
    className="glass-card p-6"
    whileHover={{ scale: 1.02 }}
  >
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className="font-bold text-white">{name}</h3>
        <p className="text-sm text-gray-400">{method} {endpoint}</p>
      </div>
      <button 
        onClick={onTest}
        disabled={loading}
        className="btn-primary px-4 py-2 text-sm"
      >
        {loading ? 'Testing...' : 'Test'}
      </button>
    </div>

    {result && (
      <div className={`mt-4 p-3 rounded ${
        result.success ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
      }`}>
        <pre className="text-xs overflow-auto max-h-40">
          {JSON.stringify(result.data || result.error, null, 2)}
        </pre>
      </div>
    )}
  </motion.div>
);

export default Test;