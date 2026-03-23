import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWorkout } from '../hooks/useWorkout';
import { ROUTES } from '../routes';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { getRecentWorkouts, getStats } = useWorkout();
  const [workouts, setWorkouts] = useState([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [recentWorkouts, workoutStats] = await Promise.all([
        getRecentWorkouts(5),
        getStats()
      ]);
      
      setWorkouts(recentWorkouts || []);
      setStats(workoutStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quotes = [
    { text: "Don't stop when you're tired. Stop when you're done.", author: "AI Coach" },
    { text: "The only bad workout is the one that didn't happen.", author: "AI Coach" },
    { text: "Success is what comes after you stop making excuses.", author: "AI Coach" },
    { text: "Your body can stand almost anything. It's your mind you have to convince.", author: "AI Coach" }
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-500/20 via-blue-500/20 to-purple-500/20 border-b border-gray-700/50">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block mb-6"
            >
              <span className="text-7xl">💪</span>
            </motion.div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-4">
              <span className="bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Welcome back, {user?.name || 'Champion'}!
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Ready to crush your fitness goals today?
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to={ROUTES.WORKOUT}
                className="group relative px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg shadow-teal-500/25 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span className="text-2xl group-hover:rotate-12 transition-transform">🏋️</span>
                  Start Workout
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </Link>
              
              <Link
                to={ROUTES.ANALYSIS}
                className="px-8 py-4 bg-gray-800/80 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-gray-700 transition-all transform hover:scale-105 border border-gray-700/50 flex items-center justify-center gap-2"
              >
                <span>📊</span>
                View Progress
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Streak Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            className="group relative bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-500/30 backdrop-blur-sm overflow-hidden"
          >
            <div className="relative flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Current Streak</h3>
              <motion.span 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-5xl"
              >
                🔥
              </motion.span>
            </div>
            <div className="text-6xl font-bold text-orange-400 mb-2">{stats?.currentStreak || 0}</div>
            <p className="text-orange-200">{stats?.currentStreak || 0} day streak! Keep going!</p>
            <div className="mt-4 flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${i < (stats?.currentStreak || 0) ? 'bg-orange-400' : 'bg-gray-700'}`}
                />
              ))}
            </div>
          </motion.div>

          {/* Quick Stats Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            className="group relative bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-2xl p-6 border border-teal-500/30 backdrop-blur-sm overflow-hidden"
          >
            <div className="relative flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Quick Stats</h3>
              <span className="text-4xl">📊</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-4xl font-bold text-teal-400">{stats?.totalWorkouts || 0}</div>
                <div className="text-sm text-gray-400">Total Workouts</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-400">{stats?.averageFormScore || 0}%</div>
                <div className="text-sm text-gray-400">Avg Form Score</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-400">{Math.floor((stats?.totalDuration || 0) / 60)}</div>
                <div className="text-sm text-gray-400">Total Minutes</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-400">{stats?.totalCalories || 0}</div>
                <div className="text-sm text-gray-400">Calories Burned</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Workouts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 mb-8 overflow-hidden"
        >
          <div className="relative">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-3xl">📋</span>
              Recent Workouts
            </h2>
            
            {workouts.length > 0 ? (
              <div className="space-y-4">
                {workouts.map((workout: any, index: number) => (
                  <motion.div
                    key={workout.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="group bg-gray-700/30 rounded-xl p-4 border border-gray-600/30 hover:border-teal-500/30 transition-all cursor-pointer"
                    onClick={() => window.location.href = `/analysis/${workout.id}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">🏋️</span>
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-teal-400 transition-colors">
                            {workout.exerciseName || workout.type}
                          </div>
                          <div className="text-sm text-gray-400">
                            {new Date(workout.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-teal-400 font-bold">{workout.reps || 0} reps</div>
                        <div className="text-sm text-gray-400">{workout.duration}s</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="text-8xl mb-6"
                >
                  🏋️
                </motion.div>
                <p className="text-gray-400 text-xl mb-6">No workouts yet. Let's change that!</p>
                <Link
                  to={ROUTES.WORKOUT}
                  className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg shadow-teal-500/25 overflow-hidden"
                >
                  <span className="relative z-10">Start your first workout!</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Motivation Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 rounded-2xl p-8 border border-purple-500/30 text-center overflow-hidden"
        >
          <div className="relative">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="text-5xl mb-4"
            >
              💭
            </motion.div>
            <p className="text-2xl text-white italic mb-2">"{randomQuote.text}"</p>
            <p className="text-purple-400 font-medium">- {randomQuote.author}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
