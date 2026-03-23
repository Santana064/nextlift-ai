import React from 'react';
import { motion } from 'framer-motion';

interface QuickStatsProps {
  stats: {
    totalWorkouts: number;
    totalMinutes: number;
    totalCalories: number;
    averageFormScore: number;
  } | null;
  analytics?: any;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ stats, analytics }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="glass-card p-4 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-20 mb-2"></div>
            <div className="h-8 bg-white/10 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Workouts',
      value: stats.totalWorkouts,
      icon: '🏋️',
      color: 'from-teal-400 to-blue-400'
    },
    {
      label: 'Total Minutes',
      value: stats.totalMinutes,
      icon: '⏱️',
      color: 'from-purple-400 to-pink-400'
    },
    {
      label: 'Calories Burned',
      value: stats.totalCalories,
      icon: '🔥',
      color: 'from-orange-400 to-red-400'
    },
    {
      label: 'Avg Form Score',
      value: `${stats.averageFormScore}%`,
      icon: '🎯',
      color: 'from-green-400 to-teal-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {(statCards || []).map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{stat.icon}</span>
            <span className={`text-xs font-medium bg-gradient-to-r ${stat.color} text-transparent bg-clip-text`}>
              {stat.label}
            </span>
          </div>
          <div className="text-2xl font-bold text-white">{stat.value}</div>
        </motion.div>
      ))}
    </div>
  );
};

export default QuickStats;

