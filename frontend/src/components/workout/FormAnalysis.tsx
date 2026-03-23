import React from 'react';
import { motion } from 'framer-motion';

interface FormAnalysisProps {
  formScore: number;
  feedback: string;
}

export const FormAnalysis: React.FC<FormAnalysisProps> = ({ formScore, feedback }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-teal-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Needs Work';
    return 'Poor';
  };

  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
        <span className="text-2xl">🎯</span>
        Form Analysis
      </h3>

      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl font-bold ${getScoreColor(formScore)}">{formScore}%</span>
        <span className={`text-sm font-medium px-2 py-1 rounded-full bg-white/10 ${getScoreColor(formScore)}`}>
          {getScoreLabel(formScore)}
        </span>
      </div>

      <div className="w-full bg-white/10 rounded-full h-2 mb-3">
        <motion.div
          className={`h-2 rounded-full ${
            formScore >= 90 ? 'bg-green-400' :
            formScore >= 80 ? 'bg-teal-400' :
            formScore >= 70 ? 'bg-yellow-400' :
            formScore >= 60 ? 'bg-orange-400' : 'bg-red-400'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${formScore}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {feedback && (
        <div className="mt-3 p-2 bg-white/5 rounded-lg">
          <p className="text-sm text-gray-300">{feedback}</p>
        </div>
      )}
    </div>
  );
};

export default FormAnalysis;
