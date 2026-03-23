import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWorkout } from '../hooks/useWorkout';
import { useAnalytics } from '../hooks/useAnalytics';
import { ROUTES } from '../routes';
import QuickStats from '../components/dashboard/QuickStats';
import RecentWorkouts from '../components/dashboard/RecentWorkouts';
import StreakCard from '../components/dashboard/StreakCard';
import MotivationQuote from '../components/dashboard/MotivationQuote';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { getRecentWorkouts, getStats } = useWorkout();
  const { getDashboardStats } = useAnalytics();

  const [workouts, setWorkouts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [recentWorkouts, workoutStats, dashboardStats] = await Promise.all([
        getRecentWorkouts(5),
        getStats(),
        getDashboardStats()
      ]);
      
      setWorkouts(recentWorkouts || []);
      setStats({
        ...workoutStats,
        ...dashboardStats
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-500/10 to-blue-500/10 border-b border-gray-700/50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                Welcome back, {user?.name || 'Demo'}!
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Ready to crush your fitness goals today?
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <Link
                to={ROUTES.WORKOUT}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg shadow-teal-500/25"
              >
                <span className="mr-2">💪</span>
                Start Workout
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Left Column - Quick Stats */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <QuickStats stats={stats} loading={loading} />
          </motion.div>

          {/* Right Column - Streak Card */}
          <motion.div variants={itemVariants}>
            <StreakCard streak={stats?.streak || 7} loading={loading} />
          </motion.div>

          {/* Recent Workouts - Full Width */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-2xl font-bold text-white mb-6">Recent Workouts</h2>
              {workouts.length > 0 ? (
                <RecentWorkouts workouts={workouts} />
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏋️</div>
                  <p className="text-gray-400 text-lg mb-4">No workouts yet.</p>
                  <Link
                    to={ROUTES.WORKOUT}
                    className="inline-flex items-center px-6 py-3 bg-teal-500/20 text-teal-400 rounded-xl hover:bg-teal-500/30 transition-all"
                  >
                    Start your first workout!
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Motivation Quote */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <MotivationQuote />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
