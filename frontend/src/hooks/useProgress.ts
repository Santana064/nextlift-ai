import { useState } from 'react';
import api from '../services/api';

export const useProgress = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const getStrengthData = async (timeframe = '6m') => {
    try {
      setLoading(true);
      const response = await api.get(`/progress/strength?timeframe=${timeframe}`);
      return response.data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getWeightData = async (timeframe = '6m') => {
    try {
      setLoading(true);
      const response = await api.get(`/progress/weight?timeframe=${timeframe}`);
      return response.data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getMeasurements = async (timeframe = '6m') => {
    try {
      setLoading(true);
      const response = await api.get(`/progress/measurements?timeframe=${timeframe}`);
      return response.data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPRs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/progress/personal-records');
      return response.data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTrends = async (timeframe = '6m') => {
    try {
      setLoading(true);
      const response = await api.get(`/progress/trends?timeframe=${timeframe}`);
      return response.data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    data,
    error,
    getStrengthData,
    getWeightData,
    getMeasurements,
    getPRs,
    getTrends
  };
};

export default useProgress;
