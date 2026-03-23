import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useWorkout } from '../hooks/useWorkout';
import { useAI } from '../hooks/useAI';
import CameraFeed from '../components/workout/CameraFeed';
import PoseOverlay from '../components/workout/PoseOverlay';
import ExerciseSelector from '../components/workout/ExerciseSelector';
import WorkoutControls from '../components/workout/WorkoutControls';
import LiveStats from '../components/workout/LiveStats';
import FormAnalysis from '../components/workout/FormAnalysis';
import RepCounter from '../components/workout/RepCounter';
import WorkoutHistory from '../components/workout/WorkoutHistory';
import WorkoutSummary from '../components/workout/WorkoutSummary';
import VoiceCoach from '../components/workout/VoiceCoach';
import ExerciseGuide from '../components/workout/ExerciseGuide';
import CameraGuidance from '../components/workout/CameraGuidance';
import { ROUTES } from '../routes';
import { exercises, type Exercise } from '../data/exercises';

// Add type for window properties
declare global {
  interface Window {
    lastKeypoints?: any[];
    movementHistory?: number[];
    lastMovementTime?: number;
    lastRepTime?: number;
    lastRepDetectedTime?: number;
    movementDirection?: string;
  }
}

const Workout: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { saveWorkout, getWorkoutHistory } = useWorkout();
  const { analyzeForm, getRealTimeFeedback } = useAI();
  const navigate = useNavigate();

  // State
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  

  const [sets, setSets] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [formScore, setFormScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [duration, setDuration] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [completedWorkout, setCompletedWorkout] = useState(null);
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [currentSets, setCurrentSets] = useState(1);
  const [currentReps, setCurrentReps] = useState(0);

  const [showGuide, setShowGuide] = useState(false);
  const [guidanceMessage, setGuidanceMessage] = useState<{ text: string; type: 'error' | 'warning' | 'info' | 'success' | null }>({ text: '', type: null });

  // Refs
  const startTimeRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastRepTimeRef = useRef<number>(0);

  // Load workout history
  useEffect(() => {
    loadWorkoutHistory();
    checkCameraPermission();
  }, []);

  const loadWorkoutHistory = async () => {
    try {
      const history = await getWorkoutHistory();
      setWorkoutHistory(history);
    } catch (error) {
      console.error('Failed to load workout history:', error);
    }
  };

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
      setCameraError(null);
    } catch (error) {
      setCameraPermission('denied');
      setCameraError('Camera access denied. Please enable camera permissions.');
    }
  };

  // Countdown timer
  useEffect(() => {
    if (showCountdown && countdown > 0) {
      countdownTimerRef.current = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (showCountdown && countdown === 0) {
      startWorkoutSession();
    }

    return () => {
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current);
      }
    };
  }, [showCountdown, countdown]);

  // Duration tracker
  useEffect(() => {
    if (isRecording && !isPaused && startTimeRef.current) {
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);
        setDuration(elapsed);
        
        // Estimate calories (simplified formula)
        const caloriesPerMinute = 5;
        setCaloriesBurned(Math.floor(elapsed / 60 * caloriesPerMinute));
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const startCountdown = () => {
    if (cameraPermission !== 'granted') {
      showToast('error', 'Please allow camera access to start workout');
      return;
    }
    
    if (!selectedExercise) {
      showToast('error', 'Please select an exercise');
      return;
    }

    setShowCountdown(true);
    setCountdown(3);
    setCurrentReps(0);
    setSets(0);
    setCurrentSet(1);
    setFormScore(0);
    setDuration(0);
    setCaloriesBurned(0);
    setShowSummary(false);
    setCompletedWorkout(null);
    
    if (voiceEnabled) {
      speak('Get ready to start ' + selectedExercise.name);
    }
  };

  const startWorkoutSession = () => {
    setShowCountdown(false);
    setIsRecording(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    
    if (voiceEnabled) {
      speak('Workout started. Maintain good form!');
    }
  };

  const pauseWorkout = () => {
    setIsPaused(true);
    if (voiceEnabled) {
      speak('Workout paused');
    }
  };

  const resumeWorkout = () => {
    setIsPaused(false);
    startTimeRef.current = Date.now() - duration * 1000;
    if (voiceEnabled) {
      speak('Resuming workout');
    }
  };

  const stopWorkout = async () => {
    setIsRecording(false);
    setIsPaused(false);
    setShowCountdown(false);
    
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }

    if (currentReps === 0) {
      showToast('warning', 'No currentReps recorded. Try again!');
      resetWorkout();
      return;
    }

    const finalSets = currentSet + (currentReps > 0 ? 1 : 0);
    
    const workoutData = {
      exerciseType: selectedExercise?.id,
      exerciseName: selectedExercise?.name,
      reps: currentReps,
      sets: currentSets,
      weight: currentWeight,
      duration,
      caloriesBurned,
      formScore: Math.round(formScore),
      notes: '',
      completedAt: new Date().toISOString()
    };

    try {
      setIsLoading(true);
      const saved = await saveWorkout(workoutData);
      setCompletedWorkout(saved);
      setShowSummary(true);
      
      if (voiceEnabled) {
        speak(`Great job! You completed ${currentReps} reps with ${Math.round(formScore)}% form score.`);
      }
      
      await loadWorkoutHistory();
    } catch (error) {
      showToast('error', 'Failed to save workout');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetWorkout = () => {
    setIsRecording(false);
    setIsPaused(false);
    setShowCountdown(false);
    setCountdown(3);
    startTimeRef.current = null;
  };

  const handleRepDetected = useCallback(() => {
    setCurrentReps(prev => {
      const newReps = prev + 1;
      console.log('Rep detected! New count:', newReps);
      return newReps;
    });
    
    // Check if set completed
    if (selectedExercise?.repsPerSet && currentReps + 1 >= selectedExercise.repsPerSet) {
      if (currentSet < (selectedExercise.sets || 1)) {
        setCurrentSet(prev => {
          const newSet = prev + 1;
          console.log('Set completed! New set:', newSet);
          return newSet;
        });
        setCurrentReps(0);
        
        if (voiceEnabled) {
          speak(`Set ${currentSet + 1} completed. Take a break.`);
        }
      } else if (currentSet === (selectedExercise.sets || 1)) {
        if (voiceEnabled) {
          speak('Great job! All sets completed!');
        }
      }
    }
  }, [currentReps, currentSet, selectedExercise, voiceEnabled]);

  const speak = (text: string) => {
    if (!voiceEnabled) return;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.includes('en-US') || v.lang.includes('en'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setCameraPermission('granted');
      setCameraError(null);
      showToast('success', 'Camera access granted!');
    } catch (error) {
      setCameraPermission('denied');
      setCameraError('Camera access denied. Please check your permissions.');
      showToast('error', 'Camera access required for workout tracking');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePoseData = useCallback(async (poseData: any) => {
    if (!isRecording || isPaused || !selectedExercise) return;

    try {
      const now = Date.now();
      
      let formScore = 85;
      let feedbackText = 'Focus on your form';
      let repDetected = false;
      let warningText = '';
      let warningType: 'error' | 'warning' | 'info' | 'success' | null = null;

      if (poseData.pose?.keypoints && poseData.pose.keypoints.length > 0) {
        const keypoints = poseData.pose.keypoints;
        
        // Count visible keypoints
        const visibleKeypoints = keypoints.filter((kp: any) => kp.score > 0.3);
        
        // Calculate bounding box
        const xCoords = visibleKeypoints.map((kp: any) => kp.x || 0);
        const yCoords = visibleKeypoints.map((kp: any) => kp.y || 0);
        
        if (xCoords.length > 0 && yCoords.length > 0) {
          const width = Math.max(...xCoords) - Math.min(...xCoords);
          const height = Math.max(...yCoords) - Math.min(...yCoords);
          const centerX = (Math.min(...xCoords) + Math.max(...xCoords)) / 2;
          
          // GUIDANCE LOGIC
          if (visibleKeypoints.length < 3) {
            warningText = '👤 No person detected';
            warningType = 'error';
          } else if (visibleKeypoints.length < 8) {
            warningText = '👤 Partial body detected - move back slightly';
            warningType = 'warning';
          } else if (width < 0.2 || height < 0.2) {
            warningText = '📏 Move closer - you\'re too far';
            warningType = 'warning';
          } else if (width > 0.8 || height > 0.8) {
            warningText = '📏 Move back - you\'re too close';
            warningType = 'warning';
          } else if (centerX < 0.3) {
            warningText = '➡️ Center yourself - move right';
            warningType = 'warning';
          } else if (centerX > 0.7) {
            warningText = '⬅️ Center yourself - move left';
            warningType = 'warning';
          } else {
            warningText = '✨ Perfect position! Ready to start';
            warningType = 'success';
          }
        }

        // Simple rep detection based on movement
        if (!window.lastKeypoints) {
          window.lastKeypoints = keypoints;
        }

        let totalMovement = 0;
        let validPoints = 0;

        keypoints.forEach((kp: any, index: number) => {
          const lastKp = window.lastKeypoints?.[index];
          if (lastKp && kp.score > 0.3 && lastKp.score > 0.3) {
            const dx = (kp.x || 0) - (lastKp.x || 0);
            const dy = (kp.y || 0) - (lastKp.y || 0);
            totalMovement += Math.sqrt(dx*dx + dy*dy);
            validPoints++;
          }
        });

        window.lastKeypoints = keypoints;

        const avgMovement = validPoints > 0 ? totalMovement / validPoints : 0;
        
        // Less sensitive rep detection
        if (avgMovement > 0.08 && now - lastRepTimeRef.current > 2000) { // Much higher threshold (0.08 instead of 0.02) and longer cooldown
          // Only count currentReps when there's SIGNIFICANT movement
          console.log('Valid rep detected! Movement:', avgMovement);
          repDetected = true;
          lastRepTimeRef.current = now;
        } else if (avgMovement > 0.005) {
          // Small movement - show as movement detected but don't count rep
          console.log('Small movement detected:', avgMovement);
        }
      }

      // Update UI with REAL guidance
      setFormScore(Math.round(formScore));
      if (warningText) {
        setGuidanceMessage({ text: warningText, type: warningType });
      } else {
        setGuidanceMessage({ text: feedbackText, type: null });
      }

      // Handle rep detection
      if (repDetected) {
        handleRepDetected();
      }

    } catch (error) {
      console.error('Pose analysis error:', error);
    }
  }, [isRecording, isPaused, selectedExercise, handleRepDetected]);

  if (showSummary && completedWorkout) {
    return (
      <WorkoutSummary
        workout={completedWorkout}
        onClose={() => {
          setShowSummary(false);
          resetWorkout();
          setSelectedExercise(null);
        }}
        onShare={() => {
          navigate(ROUTES.SOCIAL, { state: { shareWorkout: completedWorkout } });
        }}
        onNewWorkout={() => {
          setShowSummary(false);
          resetWorkout();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Hero Section */}
      <div className="relative h-48 bg-gradient-to-r from-teal-500/20 to-blue-500/20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold neon-text mb-2">
              AI Workout Coach
            </h1>
            <p className="text-gray-300 text-lg">
              Real-time form analysis with pose detection technology
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 -mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Exercise Selection */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-4 sticky top-20"
            >
              <h2 className="text-xl font-bold mb-4 neon-text">Exercises</h2>
              <ExerciseSelector
                exercises={exercises}
                selectedExercise={selectedExercise}
                onSelectExercise={setSelectedExercise}
                disabled={isRecording || showCountdown}
              />
              
              {selectedExercise && (
                <div className="mt-4 p-3 bg-white/5 rounded-xl">
                  <h3 className="font-semibold text-teal-400 mb-2">Target Muscles</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise?.targetMuscles?.map((muscle, i) => (
                      <span key={i} className="px-2 py-1 bg-teal-500/10 text-teal-400 rounded-full text-xs">
                        {muscle}
                      </span>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setShowGuide(true)}
                    className="mt-3 text-sm text-gray-400 hover:text-teal-400 flex items-center gap-1"
                  >
                    <span>📖</span> View Exercise Guide
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Main Content - Camera & Workout */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4"
            >
              {/* Camera Feed */}
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                {cameraPermission === 'denied' ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <div className="text-center p-8">
                      <div className="text-6xl mb-4">📷</div>
                      <p className="text-red-400 mb-4">{cameraError}</p>
                      <button
                        onClick={requestCameraPermission}
                        className="btn-primary"
                      >
                        Enable Camera
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <CameraFeed
                      ref={videoRef}
                      onFrame={handlePoseData}
                      isActive={isRecording && !isPaused}
                    />
                    <PoseOverlay
                      videoRef={videoRef}
                      canvasRef={canvasRef}
                      isActive={isRecording && !isPaused}
                    />
                    
                    {/* Camera Guidance Overlay */}
                    <CameraGuidance
                      message={guidanceMessage.text}
                      type={guidanceMessage.type}
                      isActive={isRecording && !isPaused && showCountdown === false}
                    />
                    
                    {/* Exercise Info Overlay */}
                    {selectedExercise && (isRecording || showCountdown) && (
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <div className="text-sm text-gray-300">{selectedExercise.name}</div>
                        <div className="text-lg font-bold text-teal-400">
                          Set {currentSet}/{selectedExercise.sets}
                        </div>
                      </div>
                    )}

                    {/* Recording Indicator */}
                    <AnimatePresence>
                      {isRecording && !isPaused && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute top-4 right-4 flex items-center space-x-2 bg-red-500/90 px-3 py-1 rounded-full"
                        >
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium">REC</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Timer */}
                    {isRecording && (
                      <div className="absolute top-4 right-20 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-sm font-medium text-white">{formatTime(duration)}</span>
                      </div>
                    )}

                    {/* Countdown Overlay */}
                    <AnimatePresence>
                      {showCountdown && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black/80 flex items-center justify-center"
                        >
                          <motion.div
                            key={countdown}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            className="w-32 h-32 gradient-bg rounded-full flex items-center justify-center"
                          >
                            <span className="text-6xl font-bold text-white">{countdown}</span>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>

              {/* Workout Controls */}
              <div className="mt-6">
                <WorkoutControls
                isRecording={isRecording}
                isPaused={isPaused}
                showCountdown={showCountdown}
                onStart={startCountdown}
                onPause={pauseWorkout}
                onResume={resumeWorkout}
                onStop={stopWorkout}
                disabled={!selectedExercise || isLoading}
                weight={currentWeight}
                onWeightChange={setCurrentWeight}
                reps={currentReps}
                onRepsChange={setCurrentReps}
                sets={currentSets}
                onSetsChange={setCurrentSets}
              />

                {/* Voice Toggle */}
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`text-sm flex items-center gap-1 px-3 py-1 rounded-full transition ${
                      voiceEnabled 
                        ? 'bg-teal-500/20 text-teal-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    <span>{voiceEnabled ? '🔊' : '🔇'}</span>
                    Voice Coach {voiceEnabled ? 'On' : 'Off'}
                  </button>
                </div>
              </div>

              {/* Live Feedback */}
              {isRecording && !isPaused && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-xl border border-teal-500/20"
                >
                  <p className="text-center text-teal-400 font-medium">{feedback}</p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right Sidebar - Stats */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Live Stats */}
              <LiveStats
                reps={currentReps}
                sets={currentSet}
                totalSets={selectedExercise?.sets || 0}
                formScore={formScore}
                duration={duration}
                calories={caloriesBurned}
                isActive={isRecording}
              />

              {/* Rep Counter */}
              {isRecording && (
                <RepCounter
                  reps={currentReps}
                  targetReps={selectedExercise?.repsPerSet || 8}
                  onRepDetected={handleRepDetected}
                />
              )}

              {/* Form Analysis */}
              <FormAnalysis
                formScore={formScore}
                feedback={feedback}
              />

              {/* Quick Tips */}
              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">💡 Quick Tips</h3>
                <ul className="space-y-2 text-xs text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400">•</span>
                    <span>Stand in well-lit area with full body visible</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400">•</span>
                    <span>Wear fitted clothing for better pose detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400">•</span>
                    <span>Keep camera at eye level</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400">•</span>
                    <span>Maintain steady breathing throughout</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Workout History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <WorkoutHistory workouts={workoutHistory} />
        </motion.div>
      </div>

      {/* Exercise Guide Modal */}
      <AnimatePresence>
        {showGuide && selectedExercise && (
          <ExerciseGuide
            exercise={selectedExercise}
            onClose={() => setShowGuide(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Workout;












