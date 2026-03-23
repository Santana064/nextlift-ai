import { useState } from 'react';
import api from '../services/api';

export const useSocial = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const getFeed = async () => {
    try {
      setLoading(true);
      const response = await api.get('/social/feed');
      return response.data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getFriends = async () => {
    try {
      setLoading(true);
      const response = await api.get('/social/friends');
      return response.data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/social/friend-requests');
      return response.data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getChallenges = async () => {
    try {
      setLoading(true);
      const response = await api.get('/social/challenges');
      return response.data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/social/leaderboard');
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
    getFeed,
    getFriends,
    getRequests,
    getChallenges,
    getLeaderboard
  };
};

export default useSocial;
