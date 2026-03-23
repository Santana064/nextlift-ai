import { useState } from 'react';
import api from '../services/api';

export const useNutrition = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const getDailyLog = async () => {
    try {
      setLoading(true);
      const response = await api.get('/nutrition/daily');
      return response.data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logMeal = async (meal: any) => {
    try {
      setLoading(true);
      const response = await api.post('/nutrition/meals', meal);
      return response.data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logWater = async (amount: number) => {
    try {
      setLoading(true);
      const response = await api.post('/nutrition/water', { amount });
      return response.data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getMealPlan = async () => {
    try {
      setLoading(true);
      const response = await api.get('/nutrition/meal-plan');
      return response.data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchFoods = async (query: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/nutrition/search-foods?q=${query}`);
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
    getDailyLog,
    logMeal,
    logWater,
    getMealPlan,
    searchFoods
  };
};

export default useNutrition;
