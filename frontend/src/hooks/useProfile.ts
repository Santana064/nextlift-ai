import { useState } from 'react';
import api from '../services/api';

export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const getProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      setLoading(true);
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAchievements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/achievements');
      return response.data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/workouts/history');
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
    getProfile,
    updateProfile,
    getAchievements,
    getHistory
  };
};

export default useProfile;
