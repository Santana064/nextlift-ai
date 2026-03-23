import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWorkout } from '../hooks/useWorkout';
import { useToast } from '../hooks/useToast';
import { ROUTES } from '../routes';

// Complete exercise database
const exerciseDatabase: Record<string, any[]> = {
  chest: [
    { name: 'Barbell Bench Press', defaultWeight: 60, defaultReps: 10, sets: 3 },
    { name: 'Incline Dumbbell Press', defaultWeight: 20, defaultReps: 10, sets: 3 },
    { name: 'Dumbbell Fly', defaultWeight: 15, defaultReps: 12, sets: 3 },
  ],
  back: [
    { name: 'Pull-ups', defaultWeight: 0, defaultReps: 8, sets: 3 },
    { name: 'Barbell Row', defaultWeight: 50, defaultReps: 10, sets: 3 },
    { name: 'Lat Pulldown', defaultWeight: 40, defaultReps: 10, sets: 3 },
  ],
  shoulders: [
    { name: 'Overhead Press', defaultWeight: 40, defaultReps: 10, sets: 3 },
    { name: 'Dumbbell Shoulder Press', defaultWeight: 20, defaultReps: 10, sets: 3 },
    { name: 'Lateral Raise', defaultWeight: 10, defaultReps: 12, sets: 3 },
  ],
  biceps: [
    { name: 'Barbell Curl', defaultWeight: 25, defaultReps: 10, sets: 3 },
    { name: 'Dumbbell Curl', defaultWeight: 12, defaultReps: 12, sets: 3 },
    { name: 'Hammer Curl', defaultWeight: 12, defaultReps: 12, sets: 3 },
  ],
  triceps: [
    { name: 'Close-grip Bench Press', defaultWeight: 40, defaultReps: 10, sets: 3 },
    { name: 'Tricep Pushdown', defaultWeight: 20, defaultReps: 12, sets: 3 },
    { name: 'Overhead Tricep Extension', defaultWeight: 15, defaultReps: 12, sets: 3 },
  ],
  quads: [
    { name: 'Barbell Squat', defaultWeight: 70, defaultReps: 8, sets: 3 },
    { name: 'Leg Press', defaultWeight: 100, defaultReps: 10, sets: 3 },
    { name: 'Front Squat', defaultWeight: 50, defaultReps: 8, sets: 3 },
  ],
  hamstrings: [
    { name: 'Romanian Deadlift', defaultWeight: 50, defaultReps: 10, sets: 3 },
    { name: 'Lying Leg Curl', defaultWeight: 40, defaultReps: 12, sets: 3 },
    { name: 'Seated Leg Curl', defaultWeight: 40, defaultReps: 12, sets: 3 },
  ],
  glutes: [
    { name: 'Hip Thrust', defaultWeight: 60, defaultReps: 12, sets: 3 },
    { name: 'Glute Bridge', defaultWeight: 40, defaultReps: 15, sets: 3 },
    { name: 'Cable Kickback', defaultWeight: 15, defaultReps: 12, sets: 3 },
  ],
  calves: [
    { name: 'Standing Calf Raise', defaultWeight: 50, defaultReps: 15, sets: 3 },
    { name: 'Seated Calf Raise', defaultWeight: 40, defaultReps: 15, sets: 3 },
  ],
  abs: [
    { name: 'Hanging Leg Raise', defaultWeight: 0, defaultReps: 12, sets: 3 },
    { name: 'Cable Crunch', defaultWeight: 30, defaultReps: 15, sets: 3 },
    { name: 'Plank', defaultWeight: 0, defaultReps: 60, sets: 3, unit: 'sec' },
  ],
};

const ManualWorkout: React.FC = () => {
  const { saveWorkout } = useWorkout();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [workoutName, setWorkoutName] = useState('');
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeView, setActiveView] = useState<'selector' | 'workout'>('selector');

  const muscleGroupOptions = [
    { id: 'chest', name: 'Chest', icon: '💪', color: 'from-red-500 to-pink-500', description: 'Push exercises for upper body' },
    { id: 'back', name: 'Back', icon: '🔱', color: 'from-orange-500 to-red-500', description: 'Pull exercises for upper body' },
    { id: 'shoulders', name: 'Shoulders', icon: '🏋️', color: 'from-yellow-500 to-orange-500', description: 'Overhead press & raises' },
    { id: 'biceps', name: 'Biceps', icon: '💪', color: 'from-green-500 to-teal-500', description: 'Arm curl exercises' },
    { id: 'triceps', name: 'Triceps', icon: '💪', color: 'from-blue-500 to-cyan-500', description: 'Extension & press exercises' },
    { id: 'quads', name: 'Quads', icon: '🦵', color: 'from-purple-500 to-pink-500', description: 'Front leg exercises' },
    { id: 'hamstrings', name: 'Hamstrings', icon: '🦵', color: 'from-pink-500 to-red-500', description: 'Back leg exercises' },
    { id: 'glutes', name: 'Glutes', icon: '🍑', color: 'from-amber-500 to-orange-500', description: 'Hip thrust & bridges' },
    { id: 'calves', name: 'Calves', icon: '🦶', color: 'from-teal-500 to-green-500', description: 'Calf raises' },
    { id: 'abs', name: 'Abs/Core', icon: '🏆', color: 'from-indigo-500 to-purple-500', description: 'Core strengthening' },
  ];

  const toggleMuscleGroup = (groupId: string) => {
    setSelectedMuscleGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(g => g !== groupId)
        : [...prev, groupId]
    );
  };

  const generateWorkout = () => {
    if (selectedMuscleGroups.length === 0) {
      showToast('error', 'Please select at least one muscle group');
      return;
    }

    setIsGenerating(true);
    
    const generatedExercises: any[] = [];
    
    selectedMuscleGroups.forEach(group => {
      const groupExercises = exerciseDatabase[group];
      if (groupExercises) {
        groupExercises.forEach(exercise => {
          generatedExercises.push({
            id: Date.now() + Math.random(),
            name: exercise.name,
            weight: exercise.defaultWeight,
            reps: exercise.defaultReps,
            sets: exercise.sets,
            muscleGroup: group,
            completedSets: 0,
            setsData: Array(exercise.sets).fill(null).map((_, i) => ({
              setNumber: i + 1,
              weight: exercise.defaultWeight,
              reps: exercise.defaultReps,
              completed: false,
              id: Date.now() + Math.random() + i
            }))
          });
        });
      }
    });
    
    setExercises(generatedExercises);
    
    const groupNames = selectedMuscleGroups.map(g => 
      muscleGroupOptions.find(opt => opt.id === g)?.name
    ).join(' + ');
    setWorkoutName(`${groupNames} Workout`);
    
    setActiveView('workout');
    showToast('success', `✅ Generated ${generatedExercises.length} exercises! Click "Complete" on each set as you finish them.`);
    setIsGenerating(false);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].setsData[setIndex][field] = value;
    setExercises(newExercises);
  };

  // Toggle between completed and incomplete - NOW ALLOWS UNMARKING
  const toggleSetComplete = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises];
    const set = newExercises[exerciseIndex].setsData[setIndex];
    const wasCompleted = set.completed;
    set.completed = !set.completed;
    
    const completedCount = newExercises[exerciseIndex].setsData.filter((s: any) => s.completed).length;
    newExercises[exerciseIndex].completedSets = completedCount;
    
    setExercises(newExercises);
    
    // Show appropriate feedback
    if (!wasCompleted && set.completed) {
      showToast('success', `✓ Set ${set.setNumber} completed! ${newExercises[exerciseIndex].name} - ${set.weight}kg x ${set.reps} reps`);
    } else if (wasCompleted && !set.completed) {
      showToast('info', `↺ Set ${set.setNumber} unmarked - you can redo it`);
    }
  };

  const calculateTotalVolume = () => {
    let total = 0;
    exercises.forEach(exercise => {
      exercise.setsData.forEach((set: any) => {
        if (set.completed) {
          total += set.weight * set.reps;
        }
      });
    });
    return total;
  };

  const calculateTotalSets = () => {
    return exercises.reduce((total, ex) => total + ex.setsData.filter((s: any) => s.completed).length, 0);
  };

  const calculateTotalPossibleSets = () => {
    return exercises.reduce((total, ex) => total + ex.setsData.length, 0);
  };

  const handleSave = async () => {
    if (!workoutName) {
      showToast('error', 'Please enter a workout name');
      return;
    }
    
    const completedSets: any[] = [];
    exercises.forEach(exercise => {
      exercise.setsData.forEach((set: any) => {
        if (set.completed) {
          completedSets.push({
            exercise: exercise.name,
            weight: set.weight,
            reps: set.reps,
            setNumber: set.setNumber,
            muscleGroup: exercise.muscleGroup
          });
        }
      });
    });
    
    if (completedSets.length === 0) {
      showToast('error', 'Please complete at least one set by clicking the "Complete" button');
      return;
    }

    setIsSaving(true);
    try {
      for (const set of completedSets) {
        await saveWorkout({
          exerciseType: set.exercise.toLowerCase(),
          exerciseName: set.exercise,
          reps: set.reps,
          sets: 1,
          weight: set.weight,
          duration: 0,
          caloriesBurned: Math.round(set.weight * set.reps * 0.1),
          formScore: 85,
          notes: `Workout: ${workoutName} | Set ${set.setNumber} of ${set.exercise}`
        });
      }
      showToast('success', `💪 ${completedSets.length} sets saved! Great work!`);
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      showToast('error', 'Failed to save workout');
    } finally {
      setIsSaving(false);
    }
  };

  const resetWorkout = () => {
    setExercises([]);
    setSelectedMuscleGroups([]);
    setWorkoutName('');
    setActiveView('selector');
  };

  const getMuscleGroupIcon = (groupId: string) => {
    return muscleGroupOptions.find(g => g.id === groupId)?.icon || '💪';
  };

  const getMuscleGroupColor = (groupId: string) => {
    return muscleGroupOptions.find(g => g.id === groupId)?.color || 'from-gray-500 to-gray-600';
  };

  // Workout View
  if (activeView === 'workout') {
    const totalVolume = calculateTotalVolume();
    const totalCompletedSets = calculateTotalSets();
    const totalPossibleSets = calculateTotalPossibleSets();
    const progressPercentage = totalPossibleSets > 0 ? (totalCompletedSets / totalPossibleSets) * 100 : 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Today's Workout</h1>
              <p className="text-gray-400">{workoutName}</p>
            </div>
            <button
              onClick={resetWorkout}
              className="px-4 py-2 bg-gray-700 rounded-lg text-gray-300 hover:bg-gray-600 transition-all"
            >
              ← New Workout
            </button>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-teal-400">{totalCompletedSets}/{totalPossibleSets}</div>
              <div className="text-sm text-gray-400">Sets Completed</div>
              <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${progressPercentage}%` }} />
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{exercises.length}</div>
              <div className="text-sm text-gray-400">Exercises</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">{totalVolume} kg</div>
              <div className="text-sm text-gray-400">Total Volume</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{Math.round(totalVolume * 0.1)}</div>
              <div className="text-sm text-gray-400">Est. Calories</div>
            </div>
          </div>

          {/* Instructions */}
          {totalCompletedSets === 0 && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <p className="text-blue-400 text-sm flex items-center gap-2">
                <span>💡</span> Click "Complete" on each set after you finish it. Click again to unmark if needed!
              </p>
            </div>
          )}

          {/* Exercises List */}
          <div className="space-y-6">
            {exercises.map((exercise, exIndex) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50"
              >
                {/* Exercise Header */}
                <div className={`bg-gradient-to-r ${getMuscleGroupColor(exercise.muscleGroup)}/20 p-4 border-b border-gray-700/50`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getMuscleGroupIcon(exercise.muscleGroup)}</span>
                      <div>
                        <h3 className="text-xl font-bold text-white">{exercise.name}</h3>
                        <p className="text-sm text-gray-400 capitalize">{exercise.muscleGroup}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Sets Completed</div>
                      <div className="text-xl font-bold text-teal-400">{exercise.completedSets}/{exercise.setsData.length}</div>
                    </div>
                  </div>
                </div>

                {/* Sets Table */}
                <div className="p-4">
                  <div className="grid grid-cols-12 gap-2 mb-2 text-xs text-gray-500 px-2">
                    <div className="col-span-1 text-center">Set</div>
                    <div className="col-span-4">Weight (kg)</div>
                    <div className="col-span-4">Reps</div>
                    <div className="col-span-3 text-center">Status</div>
                  </div>
                  
                  <div className="space-y-2">
                    {exercise.setsData.map((set: any, setIndex: number) => (
                      <div
                        key={set.id}
                        className={`grid grid-cols-12 gap-2 p-2 rounded-lg transition-all ${
                          set.completed ? 'bg-green-500/20 border border-green-500/40' : 'bg-gray-700/20'
                        }`}
                      >
                        <div className="col-span-1 flex items-center justify-center">
                          <span className="text-white font-medium">{set.setNumber}</span>
                        </div>
                        <div className="col-span-4">
                          <input
                            type="number"
                            value={set.weight}
                            onChange={(e) => updateSet(exIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                            className={`w-full px-2 py-1 border rounded-lg text-white text-center ${
                              set.completed ? 'bg-green-500/20 border-green-500/30' : 'bg-gray-700/50 border-gray-600'
                            }`}
                            disabled={set.completed}
                          />
                        </div>
                        <div className="col-span-4">
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => updateSet(exIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                            className={`w-full px-2 py-1 border rounded-lg text-white text-center ${
                              set.completed ? 'bg-green-500/20 border-green-500/30' : 'bg-gray-700/50 border-gray-600'
                            }`}
                            disabled={set.completed}
                          />
                        </div>
                        <div className="col-span-3 flex justify-center items-center">
                          <button
                            onClick={() => toggleSetComplete(exIndex, setIndex)}
                            className={`px-4 py-1 rounded-lg text-sm font-medium transition-all ${
                              set.completed
                                ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                : 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30'
                            }`}
                          >
                            {set.completed ? '↺ Undo' : '✓ Complete'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Save Button */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={resetWorkout}
              className="px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || calculateTotalSets() === 0}
              className={`flex-1 py-3 font-semibold rounded-xl transition-all ${
                calculateTotalSets() > 0
                  ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:from-teal-600 hover:to-blue-600'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? 'Saving...' : `Save Workout (${calculateTotalSets()} sets completed) 💪`}
            </button>
          </div>

          {calculateTotalSets() === 0 && (
            <p className="text-center text-gray-500 text-sm mt-4">
              Click "Complete" on each set after you finish it (click again to undo)
            </p>
          )}
        </div>
      </div>
    );
  }

  // Muscle Group Selector View
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
              AI Workout Generator
            </span>
          </h1>
          <p className="text-gray-400">Select which muscle groups you want to train today</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {muscleGroupOptions.map(group => (
            <motion.button
              key={group.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleMuscleGroup(group.id)}
              className={`p-6 rounded-2xl text-left transition-all ${
                selectedMuscleGroups.includes(group.id)
                  ? `bg-gradient-to-r ${group.color} text-white shadow-lg`
                  : 'bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{group.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{group.name}</h3>
                  <p className="text-sm opacity-80">{group.description}</p>
                  {selectedMuscleGroups.includes(group.id) && (
                    <div className="mt-2 text-xs font-semibold">✓ Selected</div>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {selectedMuscleGroups.length > 0 && (
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 mb-8">
            <h3 className="text-lg font-semibold text-white mb-3">Selected Muscle Groups</h3>
            <div className="flex flex-wrap gap-2">
              {selectedMuscleGroups.map(group => {
                const groupInfo = muscleGroupOptions.find(g => g.id === group);
                return (
                  <span key={group} className="px-3 py-1.5 bg-teal-500/20 text-teal-400 rounded-full text-sm flex items-center gap-1">
                    {groupInfo?.icon} {groupInfo?.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={generateWorkout}
          disabled={isGenerating || selectedMuscleGroups.length === 0}
          className="w-full py-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating Workout...
            </>
          ) : (
            <>
              <span>✨</span>
              Generate {selectedMuscleGroups.length} Muscle Group Workout
              <span>🎯</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ManualWorkout;
