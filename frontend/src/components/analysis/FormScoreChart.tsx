import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface FormScoreChartProps {
  data: Array<{ date: string; score: number }>;
  currentScore?: number;
}

export const FormScoreChart: React.FC<FormScoreChartProps> = ({ data, currentScore }) => {
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Form Score',
        data: data.map(d => d.score),
        borderColor: '#2DD4BF',
        backgroundColor: 'rgba(45, 212, 191, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1a1f2e',
        titleColor: '#fff',
        bodyColor: '#9CA3AF',
        borderColor: '#2DD4BF',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#9CA3AF'
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
    <div className="w-full h-64">
      {currentScore && (
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-400">Current Session</span>
          <span className="text-2xl font-bold text-teal-400">{currentScore}%</span>
        </div>
      )}
      <Line data={chartData} options={options} />
    </div>
  );
};

export default FormScoreChart;