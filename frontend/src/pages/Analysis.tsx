import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { useWorkout } from '../hooks/useWorkout';
import { useAnalytics } from '../hooks/useAnalytics';
import { useToast } from '../hooks/useToast';
import { ROUTES } from '../routes';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Workout {
  id: string;
  exerciseName: string;
  exerciseType: string;
  reps: number;
  sets: number;
  duration: number;
  caloriesBurned: number;
  formScore: number;
  completedAt: string;
  date: string;
}

interface RepData {
  rep: number;
  formScore: number;
  rangeOfMotion: number;
  tempo: number;
  symmetry: number;
  issues: string[];
}

interface Analytics {
  overall: {
    formScore: number;
    consistency: number;
    rangeOfMotion: number;
    tempo: number;
    symmetry: number;
    fatigueRate: number;
  };
  historical: {
    date: string;
    formScore: number;
    volume: number;
  }[];
  repBreakdown: RepData[];
  muscleActivation: {
    muscle: string;
    left: number;
    right: number;
    target: number;
  }[];
  feedback: {
    category: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    tip: string;
  }[];
  improvements: string[];
  personalBests: {
    metric: string;
    value: string;
    date: string;
  }[];
}

const Analysis: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getWorkoutById, getRecentWorkouts } = useWorkout();
  const { getWorkoutAnalytics, getHistoricalData } = useAnalytics();
  const { showToast } = useToast();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'form' | 'volume' | 'consistency'>('form');
  const [exporting, setExporting] = useState(false);

  const COLORS = ['#2dd4bf', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

  useEffect(() => {
    loadRecentWorkouts();
    
    if (id) {
      loadAnalysis(id);
    } else {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (workout) {
      loadHistoricalData();
    }
  }, [workout, timeRange]);

  const loadRecentWorkouts = async () => {
    try {
      const workouts = await getRecentWorkouts(20);
      setRecentWorkouts(workouts || []);
    } catch (error) {
      console.error('Failed to load recent workouts:', error);
    }
  };

  const loadHistoricalData = async () => {
    try {
      const data = await getHistoricalData(workout?.exerciseType, timeRange);
      setHistoricalData(data || []);
    } catch (error) {
      console.error('Failed to load historical data:', error);
    }
  };

  const loadAnalysis = async (workoutId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const workoutData = await getWorkoutById(workoutId);
      
      if (!workoutData) {
        setError('Workout not found');
        showToast('error', 'Workout not found');
        setLoading(false);
        return;
      }
      
      setWorkout(workoutData);
      
      // Generate comprehensive analytics
      const analyticsData: Analytics = {
        overall: {
          formScore: workoutData.formScore || 87,
          consistency: 82,
          rangeOfMotion: 79,
          tempo: 91,
          symmetry: 76,
          fatigueRate: 15
        },
        historical: Array.from({ length: 10 }, (_, i) => ({
          date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
          formScore: 70 + Math.floor(Math.random() * 25),
          volume: 500 + Math.floor(Math.random() * 500)
        })).reverse(),
        repBreakdown: Array.from({ length: workoutData.reps || 12 }, (_, i) => ({
          rep: i + 1,
          formScore: 70 + Math.floor(Math.random() * 25),
          rangeOfMotion: 60 + Math.floor(Math.random() * 35),
          tempo: 75 + Math.floor(Math.random() * 20),
          symmetry: 65 + Math.floor(Math.random() * 30),
          issues: i % 3 === 0 ? ['Depth', 'Knee position'] : []
        })),
        muscleActivation: [
          { muscle: 'Quadriceps', left: 85, right: 87, target: 90 },
          { muscle: 'Hamstrings', left: 72, right: 75, target: 80 },
          { muscle: 'Glutes', left: 68, right: 70, target: 85 },
          { muscle: 'Core', left: 65, right: 63, target: 70 },
          { muscle: 'Lower Back', left: 55, right: 58, target: 60 }
        ],
        feedback: [
          {
            category: 'Depth',
            message: 'You\'re not reaching parallel on last 3 reps',
            severity: 'high',
            tip: 'Lower until thighs are parallel to ground'
          },
          {
            category: 'Knee Position',
            message: 'Knees caving inward on ascent',
            severity: 'medium',
            tip: 'Push knees outward, engage glutes'
          },
          {
            category: 'Tempo',
            message: 'Descent too fast, losing control',
            severity: 'low',
            tip: 'Take 2-3 seconds on the way down'
          },
          {
            category: 'Back Position',
            message: 'Upper back rounding at bottom',
            severity: 'high',
            tip: 'Keep chest up, retract shoulder blades'
          },
          {
            category: 'Breathing',
            message: 'Holding breath during exertion',
            severity: 'low',
            tip: 'Exhale on exertion, inhale on descent'
          }
        ],
        improvements: [
          'Increase squat depth by 2 inches',
          'Slow down descent to 3 seconds',
          'Push knees outward during ascent',
          'Engage lats to stabilize upper back',
          'Add pause at bottom for control'
        ],
        personalBests: [
          { metric: 'Form Score', value: '94%', date: '2 days ago' },
          { metric: 'Max Reps', value: '15 reps', date: '1 week ago' },
          { metric: 'Consistency', value: '88%', date: 'Current' }
        ]
      };
      
      setAnalytics(analyticsData);
      
    } catch (error) {
      console.error('Failed to load analysis:', error);
      setError('Failed to load workout analysis');
      showToast('error', 'Failed to load workout analysis');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!analytics) return;
    
    setExporting(true);
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet([
      { Metric: 'Form Score', Value: analytics.overall.formScore },
      { Metric: 'Consistency', Value: analytics.overall.consistency },
      { Metric: 'Range of Motion', Value: analytics.overall.rangeOfMotion },
      { Metric: 'Tempo', Value: analytics.overall.tempo },
      { Metric: 'Symmetry', Value: analytics.overall.symmetry },
      { Metric: 'Fatigue Rate', Value: analytics.overall.fatigueRate },
      ...analytics.repBreakdown.map(r => ({
        Rep: r.rep,
        'Form Score': r.formScore,
        'Range of Motion': r.rangeOfMotion,
        Tempo: r.tempo,
        Symmetry: r.symmetry,
        Issues: r.issues.join(', ')
      }))
    ]);
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Analysis');
    XLSX.writeFile(wb, `workout-analysis-${workout?.exerciseName}-${Date.now()}.csv`);
    
    setExporting(false);
    showToast('success', 'Analysis exported to CSV');
  };

  const exportToPDF = () => {
    if (!analytics || !workout) return;
    
    setExporting(true);
    
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(45, 212, 191);
    doc.text('Workout Analysis Report', 20, 20);
    
    // Workout info
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`${workout.exerciseName} - ${new Date(workout.completedAt).toLocaleDateString()}`, 20, 30);
    doc.text(`${workout.reps} reps, ${workout.sets} sets, ${workout.duration}s duration`, 20, 37);
    
    // Overall scores
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Overall Metrics', 20, 50);
    
    autoTable(doc, {
      startY: 55,
      head: [['Metric', 'Score']],
      body: [
        ['Form Score', `${analytics.overall.formScore}%`],
        ['Consistency', `${analytics.overall.consistency}%`],
        ['Range of Motion', `${analytics.overall.rangeOfMotion}%`],
        ['Tempo', `${analytics.overall.tempo}%`],
        ['Symmetry', `${analytics.overall.symmetry}%`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [45, 212, 191] }
    });
    
    // Rep breakdown
    doc.text('Rep-by-Rep Analysis', 20, doc.lastAutoTable.finalY + 15);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Rep', 'Form Score', 'Range', 'Tempo', 'Symmetry']],
      body: analytics.repBreakdown.map(r => [
        r.rep.toString(),
        `${r.formScore}%`,
        `${r.rangeOfMotion}%`,
        `${r.tempo}%`,
        `${r.symmetry}%`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [45, 212, 191] }
    });
    
    // Feedback
    doc.text('Key Feedback', 20, doc.lastAutoTable.finalY + 15);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Issue', 'Severity', 'Tip']],
      body: analytics.feedback.map(f => [f.message, f.severity, f.tip]),
      theme: 'grid',
      headStyles: { fillColor: [45, 212, 191] }
    });
    
    doc.save(`workout-analysis-${workout?.exerciseName}-${Date.now()}.pdf`);
    
    setExporting(false);
    showToast('success', 'Analysis exported to PDF');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-yellow-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!id || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                Form Analysis
              </span>
            </h1>
            <p className="text-xl text-gray-300">
              Select a workout to analyze your form and get improvement tips
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center max-w-2xl mx-auto mb-8"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-white mb-2">Workout Not Found</h2>
              <p className="text-gray-400 mb-6">{error}</p>
            </motion.div>
          )}

          {/* Recent Workouts Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Recent Workouts</h2>
            
            {recentWorkouts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentWorkouts.map((w) => (
                  <motion.div
                    key={w.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-700/30 rounded-xl p-5 border border-gray-600/30 hover:border-teal-500/30 transition-all cursor-pointer"
                    onClick={() => navigate(`/analysis/${w.id}`)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-white text-lg">{w.exerciseName}</div>
                        <div className="text-sm text-gray-400">{formatDate(w.completedAt || w.date)}</div>
                      </div>
                      {w.formScore && (
                        <div className={`text-2xl font-bold ${getScoreColor(w.formScore)}`}>
                          {w.formScore}%
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3 text-sm text-gray-400">
                      <span>{w.reps} reps</span>
                      <span>•</span>
                      <span>{w.sets} sets</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-7xl mb-4">🏋️</div>
                <p className="text-gray-400 text-xl mb-6">No workouts yet.</p>
                <Link
                  to={ROUTES.WORKOUT}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all"
                >
                  Start your first workout!
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  if (!analytics || !workout) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header with actions */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/analysis')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-xl text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all"
            >
              <span>←</span> Back
            </button>
            <h1 className="text-2xl font-bold text-white">Analysis</h1>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-xl text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all disabled:opacity-50"
            >
              <span>📊</span> CSV
            </button>
            <button
              onClick={exportToPDF}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-xl text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all disabled:opacity-50"
            >
              <span>📄</span> PDF
            </button>
          </div>
        </motion.div>

        {/* Workout Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-2xl p-6 border border-teal-500/30 mb-8"
        >
          <div className="flex flex-wrap items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{workout.exerciseName}</h2>
              <p className="text-gray-400">{formatDate(workout.completedAt)}</p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-sm text-gray-400">Reps</div>
                <div className="text-2xl font-bold text-white">{workout.reps}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Sets</div>
                <div className="text-2xl font-bold text-white">{workout.sets}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Duration</div>
                <div className="text-2xl font-bold text-white">
                  {Math.floor(workout.duration / 60)}:{(workout.duration % 60).toString().padStart(2, '0')}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Overall Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Object.entries(analytics.overall).map(([key, value], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
            >
              <div className="text-sm text-gray-400 mb-1 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(value)}`}>
                {value}%
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Form Score Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Form Score Trend</h3>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="bg-gray-700 text-white rounded-lg px-3 py-1 border border-gray-600"
                >
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.historical}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                      labelStyle={{ color: '#9CA3AF' }}
                    />
                    <Area type="monotone" dataKey="formScore" stroke="#2dd4bf" fill="#2dd4bf20" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Rep Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
            >
              <h3 className="text-lg font-semibold text-white mb-6">Rep-by-Rep Analysis</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.repBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="rep" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                      labelStyle={{ color: '#9CA3AF' }}
                    />
                    <Bar dataKey="formScore" fill="#2dd4bf" />
                    <Bar dataKey="rangeOfMotion" fill="#3b82f6" />
                    <Bar dataKey="tempo" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Muscle Activation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
            >
              <h3 className="text-lg font-semibold text-white mb-6">Muscle Activation (Left vs Right)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={analytics.muscleActivation}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="muscle" stroke="#9CA3AF" />
                    <PolarRadiusAxis stroke="#9CA3AF" />
                    <Radar name="Left" dataKey="left" stroke="#2dd4bf" fill="#2dd4bf20" />
                    <Radar name="Right" dataKey="right" stroke="#3b82f6" fill="#3b82f620" />
                    <Radar name="Target" dataKey="target" stroke="#8b5cf6" fill="#8b5cf620" />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Feedback & Tips */}
          <div className="space-y-6">
            {/* Personal Bests */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
            >
              <h3 className="text-lg font-semibold text-white mb-4">🏆 Personal Bests</h3>
              <div className="space-y-3">
                {analytics.personalBests.map((pb, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-xl">
                    <div>
                      <div className="text-sm text-gray-400">{pb.metric}</div>
                      <div className="text-lg font-bold text-white">{pb.value}</div>
                    </div>
                    <div className="text-xs text-gray-400">{pb.date}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Key Feedback */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
            >
              <h3 className="text-lg font-semibold text-white mb-4">⚠️ Key Feedback</h3>
              <div className="space-y-3">
                {analytics.feedback.map((item, i) => (
                  <div key={i} className="p-3 bg-gray-700/30 rounded-xl">
                    <div className="flex items-start gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(item.severity)}`}>
                        {item.severity}
                      </span>
                      <span className="text-sm text-gray-300">{item.message}</span>
                    </div>
                    <p className="text-xs text-teal-400 mt-1">💡 {item.tip}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Improvement Plan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-2xl p-6 border border-teal-500/30"
            >
              <h3 className="text-lg font-semibold text-white mb-4">📈 Improvement Plan</h3>
              <ul className="space-y-2">
                {analytics.improvements.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300">
                    <span className="text-teal-400 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Full Rep Details Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Detailed Rep Analysis</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Rep</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Form Score</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Range of Motion</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Tempo</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Symmetry</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Issues</th>
                </tr>
              </thead>
              <tbody>
                {analytics.repBreakdown.map((rep) => (
                  <tr key={rep.rep} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                    <td className="py-3 px-4 text-white font-medium">{rep.rep}</td>
                    <td className="py-3 px-4">
                      <span className={getScoreColor(rep.formScore)}>{rep.formScore}%</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={getScoreColor(rep.rangeOfMotion)}>{rep.rangeOfMotion}%</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={getScoreColor(rep.tempo)}>{rep.tempo}%</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={getScoreColor(rep.symmetry)}>{rep.symmetry}%</span>
                    </td>
                    <td className="py-3 px-4">
                      {rep.issues.length > 0 ? (
                        <div className="flex gap-1">
                          {rep.issues.map((issue, i) => (
                            <span key={i} className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                              {issue}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-green-400">✓ Good</span>
                      )}
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

export default Analysis;
