import { useState, useCallback } from 'react';
import api from '../services/api';

export const useAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/dashboard');
      return response.data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getWorkoutAnalytics = useCallback(async (workoutId?: string) => {
    try {
      setLoading(true);
      const url = workoutId ? `/analytics/workouts/${workoutId}` : '/analytics/workouts';
      const response = await api.get(url);
      return response.data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getDashboardStats,
    getWorkoutAnalytics
  };
};

// Also export as default for backward compatibility
export default useAnalytics;
