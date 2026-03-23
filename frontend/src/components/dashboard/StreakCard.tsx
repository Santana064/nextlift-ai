import React from 'react';
import { motion } from 'framer-motion';

interface StreakCardProps {
  streak: number;
}

export const StreakCard: React.FC<StreakCardProps> = ({ streak }) => {
  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
        <span className="text-2xl">🔥</span>
        Current Streak
      </h3>
      <div className="text-center">
        <div className="text-4xl font-bold text-orange-400 mb-1">{streak}</div>
        <div className="text-xs text-gray-400">days</div>
      </div>
      <div className="mt-3 text-xs text-gray-400">
        {streak === 0 ? 'Start your streak today!' : 
         streak === 1 ? 'Great start! Keep it going!' : 
         `${streak} day streak! You're on fire!`}
      </div>
    </div>
  );
};

export default StreakCard;
