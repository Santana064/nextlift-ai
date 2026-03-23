import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWorkout } from '../hooks/useWorkout';
import { useAuth } from '../hooks/useAuth';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

const Progress: React.FC = () => {
  const { user } = useAuth();
  const { getWorkouts, getStats } = useWorkout();
  const [workouts, setWorkouts] = useState([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [chartType, setChartType] = useState('form');
  const [selectedExercise, setSelectedExercise] = useState('all');

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allWorkouts, workoutStats] = await Promise.all([
        getWorkouts(),
        getStats()
      ]);
      setWorkouts(allWorkouts || []);
      setStats(workoutStats);
    } catch (error) {
      console.error('Failed to load progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process data for charts
  const getDateRange = () => {
    const now = new Date();
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const startDate = new Date(now.setDate(now.getDate() - days));
    return startDate;
  };

  const chartData = workouts
    .filter(w => new Date(w.createdAt) >= getDateRange())
    .filter(w => selectedExercise === 'all' || w.type === selectedExercise)
    .map(w => ({
      date: new Date(w.createdAt).toLocaleDateString(),
      formScore: w.formScore || 0,
      duration: Math.floor(w.duration / 60),
      calories: w.calories || 0,
      reps: w.reps || 0,
      exercise: w.exerciseName || w.type
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const statsCards = [
    { label: 'Total Workouts', value: stats?.totalWorkouts || 0, icon: '🏋️', color: 'from-teal-500 to-blue-500' },
    { label: 'Total Time', value: `${Math.floor((stats?.totalDuration || 0) / 60)}h ${(stats?.totalDuration || 0) % 60}m`, icon: '⏱️', color: 'from-blue-500 to-purple-500' },
    { label: 'Calories Burned', value: (stats?.totalCalories || 0).toLocaleString(), icon: '🔥', color: 'from-orange-500 to-red-500' },
    { label: 'Avg Form Score', value: `${stats?.averageFormScore || 0}%`, icon: '🎯', color: 'from-purple-500 to-pink-500' },
    { label: 'Current Streak', value: `${stats?.currentStreak || 0} days`, icon: '⚡', color: 'from-yellow-500 to-orange-500' },
    { label: 'Best Form', value: `${Math.max(...(workouts.map(w => w.formScore || 0)))}%`, icon: '🏆', color: 'from-green-500 to-teal-500' }
  ];

  const exerciseTypes = ['all', ...new Set(workouts.map(w => w.type))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Progress Dashboard
            </span>
          </h1>
          <p className="text-gray-400">Track your fitness journey with detailed analytics</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-gradient-to-br ${stat.color}/10 rounded-2xl p-4 border border-${stat.color.split('-')[1]}-500/30 backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <span className="text-lg font-bold text-white">{stat.value}</span>
              </div>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2 bg-gray-800/50 rounded-lg p-1">
            {['week', 'month', 'quarter'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range === 'week' ? '7 Days' : range === 'month' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2 bg-gray-800/50 rounded-lg p-1">
            {['form', 'duration', 'calories', 'reps'].map(type => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  chartType === type
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {type === 'form' ? 'Form Score' : 
                 type === 'duration' ? 'Duration' :
                 type === 'calories' ? 'Calories' : 'Reps'}
              </button>
            ))}
          </div>

          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="bg-gray-800/50 text-white rounded-lg px-4 py-2 border border-gray-700"
          >
            {exerciseTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Exercises' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Main Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-6">Performance Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
                <Area
                  type="monotone"
                  dataKey={chartType}
                  stroke={chartType === 'form' ? '#2dd4bf' : chartType === 'duration' ? '#3b82f6' : chartType === 'calories' ? '#f59e0b' : '#8b5cf6'}
                  fill={chartType === 'form' ? '#2dd4bf20' : chartType === 'duration' ? '#3b82f620' : chartType === 'calories' ? '#f59e0b20' : '#8b5cf620'}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Exercise Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
          >
            <h2 className="text-xl font-bold text-white mb-6">Workout Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.workoutsByType ? Object.entries(stats.workoutsByType).map(([name, value]) => ({ name, value })) : []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(stats?.workoutsByType || {}).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#2dd4bf', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
          >
            <h2 className="text-xl font-bold text-white mb-6">Form Score Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { range: '90-100%', count: workouts.filter(w => (w.formScore || 0) >= 90).length },
                  { range: '75-89%', count: workouts.filter(w => (w.formScore || 0) >= 75 && (w.formScore || 0) < 90).length },
                  { range: '60-74%', count: workouts.filter(w => (w.formScore || 0) >= 60 && (w.formScore || 0) < 75).length },
                  { range: '<60%', count: workouts.filter(w => (w.formScore || 0) < 60).length }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="range" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2dd4bf" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Recent Workouts Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
        >
          <h2 className="text-xl font-bold text-white mb-6">Recent Workouts</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400">Exercise</th>
                  <th className="text-left py-3 px-4 text-gray-400">Reps</th>
                  <th className="text-left py-3 px-4 text-gray-400">Sets</th>
                  <th className="text-left py-3 px-4 text-gray-400">Duration</th>
                  <th className="text-left py-3 px-4 text-gray-400">Calories</th>
                  <th className="text-left py-3 px-4 text-gray-400">Form Score</th>
                 </tr>
              </thead>
              <tbody>
                {workouts.slice(0, 10).map((workout: any) => (
                  <tr key={workout.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                    <td className="py-3 px-4 text-white">{new Date(workout.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-gray-300">{workout.exerciseName || workout.type}</td>
                    <td className="py-3 px-4 text-gray-300">{workout.reps || '-'}</td>
                    <td className="py-3 px-4 text-gray-300">{workout.sets || '-'}</td>
                    <td className="py-3 px-4 text-gray-300">{workout.duration}s</td>
                    <td className="py-3 px-4 text-gray-300">{workout.calories || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        (workout.formScore || 0) >= 90 ? 'bg-green-500/20 text-green-400' :
                        (workout.formScore || 0) >= 75 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {workout.formScore || 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Progress;
