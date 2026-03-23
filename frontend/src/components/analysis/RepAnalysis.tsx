import React from 'react';
import { Bar } from 'react-chartjs-2';

interface RepAnalysisProps {
  sets: number;
  reps: number;
  targetReps: number;
  setData?: Array<{ set: number; reps: number; formScore: number }>;
}

export const RepAnalysis: React.FC<RepAnalysisProps> = ({ sets, reps, targetReps, setData }) => {
  const chartData = {
    labels: setData ? setData.map(d => `Set ${d.set}`) : Array.from({ length: sets }, (_, i) => `Set ${i + 1}`),
    datasets: [
      {
        label: 'Reps Completed',
        data: setData ? setData.map(d => d.reps) : Array.from({ length: sets }, () => Math.floor(reps / sets)),
        backgroundColor: '#2DD4BF',
        borderRadius: 4
      },
      {
        label: 'Target Reps',
        data: setData ? setData.map(() => targetReps) : Array.from({ length: sets }, () => targetReps),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9CA3AF'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#9CA3AF',
          stepSize: 5
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#9CA3AF'
        }
      }
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/5 p-3 rounded-lg">
          <div className="text-xs text-gray-400">Total Reps</div>
          <div className="text-xl font-bold text-teal-400">{reps}</div>
        </div>
        <div className="bg-white/5 p-3 rounded-lg">
          <div className="text-xs text-gray-400">Average/Set</div>
          <div className="text-xl font-bold text-blue-400">{Math.round(reps / sets)}</div>
        </div>
      </div>
      <div className="h-48">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default RepAnalysis;