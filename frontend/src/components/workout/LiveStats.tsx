import React from 'react';
import { motion } from 'framer-motion';

interface LiveStatsProps {
  reps: number;
  sets: number;
  totalSets: number;
  formScore: number;
  duration: number;
  calories: number;
  isActive: boolean;
}

export const LiveStats: React.FC<LiveStatsProps> = ({
  reps,
  sets,
  totalSets,
  formScore,
  duration,
  calories,
  isActive
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-semibold text-gray-400 mb-3">Live Stats</h3>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Reps</span>
            <span className="text-teal-400 font-bold">{reps}</span>
          </div>
          <motion.div
            className="h-1 bg-white/10 rounded-full overflow-hidden"
            animate={isActive ? { scaleX: [1, 1.02, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="h-full gradient-bg"
              initial={{ width: 0 }}
              animate={{ width: `${(reps / 30) * 100}%` }}
            />
          </motion.div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Sets</span>
            <span className="text-blue-400 font-bold">{sets}/{totalSets}</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-400"
              initial={{ width: 0 }}
              animate={{ width: `${totalSets > 0 ? (sets / totalSets) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="bg-white/5 p-2 rounded">
            <div className="text-xs text-gray-400">Form Score</div>
            <div className="text-lg font-bold text-teal-400">{formScore}%</div>
          </div>
          <div className="bg-white/5 p-2 rounded">
            <div className="text-xs text-gray-400">Time</div>
            <div className="text-lg font-bold text-blue-400">{formatTime(duration)}</div>
          </div>
          <div className="bg-white/5 p-2 rounded col-span-2">
            <div className="text-xs text-gray-400">Calories</div>
            <div className="text-lg font-bold text-purple-400">{calories}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStats;

