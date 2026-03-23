import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import api from '../services/api';
import { ROUTES } from '../routes';

interface UserProfile {
  name: string;
  age: number;
  height: number;
  weight: number;
  gender: string;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  primaryGoal: 'muscle_gain' | 'strength' | 'weight_loss' | 'endurance' | 'general';
  experience: number; // years
  equipment: string[];
  availableDays: number;
}

const Onboarding: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || '',
    age: 25,
    height: 170,
    weight: 70,
    gender: 'male',
    fitnessLevel: 'intermediate',
    primaryGoal: 'general',
    experience: 1,
    equipment: ['dumbbells', 'bench'],
    availableDays: 3
  });

  const goals = [
    { id: 'muscle_gain', name: '💪 Muscle Gain', description: 'Build muscle mass and size', color: 'from-red-500 to-pink-500' },
    { id: 'strength', name: '🏋️ Strength', description: 'Get stronger, lift heavier', color: 'from-orange-500 to-red-500' },
    { id: 'weight_loss', name: '🔥 Weight Loss', description: 'Burn fat, get lean', color: 'from-green-500 to-teal-500' },
    { id: 'endurance', name: '🏃 Endurance', description: 'Improve stamina and cardio', color: 'from-blue-500 to-cyan-500' },
    { id: 'general', name: '🎯 General Fitness', description: 'Overall health and wellness', color: 'from-purple-500 to-pink-500' }
  ];

  const fitnessLevels = [
    { id: 'beginner', name: '🌟 Beginner', description: 'New to fitness, learning basics' },
    { id: 'intermediate', name: '📈 Intermediate', description: 'Consistent training, good form' },
    { id: 'advanced', name: '🏆 Advanced', description: 'Experienced, ready for intensity' }
  ];

  const equipmentOptions = [
    { id: 'barbell', name: 'Barbell', icon: '🏋️' },
    { id: 'dumbbells', name: 'Dumbbells', icon: '💪' },
    { id: 'kettlebells', name: 'Kettlebells', icon: '🔔' },
    { id: 'machine', name: 'Cable/Machine', icon: '⚙️' },
    { id: 'bands', name: 'Resistance Bands', icon: '🎀' },
    { id: 'bodyweight', name: 'Bodyweight Only', icon: '🧘' }
  ];

  const handleComplete = async () => {
    try {
      await api.put('/users/profile', profile);
      localStorage.setItem('onboarding_completed', 'true');
      showToast('success', 'Profile setup complete! Let\'s start your fitness journey! 🚀');
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      console.error('Failed to save profile:', error);
      showToast('error', 'Failed to save profile. Please try again.');
    }
  };

  const steps = [
    {
      title: 'Welcome! Let\'s get to know you',
      description: 'Tell us about yourself so we can personalize your experience',
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">What's your name?</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
              placeholder="Enter your name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Height (cm)</label>
              <input
                type="number"
                value={profile.height}
                onChange={(e) => setProfile({ ...profile, height: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Weight (kg)</label>
              <input
                type="number"
                value={profile.weight}
                onChange={(e) => setProfile({ ...profile, weight: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Years of experience</label>
            <input
              type="range"
              min="0"
              max="20"
              value={profile.experience}
              onChange={(e) => setProfile({ ...profile, experience: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-center text-gray-400 mt-1">{profile.experience} years</div>
          </div>
        </div>
      )
    },
    {
      title: 'What\'s your fitness goal?',
      description: 'Choose your primary focus',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => (
            <button
              key={goal.id}
              onClick={() => setProfile({ ...profile, primaryGoal: goal.id as any })}
              className={`p-6 rounded-xl text-left transition-all ${
                profile.primaryGoal === goal.id
                  ? `bg-gradient-to-r ${goal.color} text-white shadow-lg`
                  : 'bg-gray-700/30 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <div className="text-3xl mb-2">{goal.name}</div>
              <div className="text-sm opacity-80">{goal.description}</div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: 'Your fitness level',
      description: 'Help us understand your experience',
      content: (
        <div className="space-y-4">
          {fitnessLevels.map(level => (
            <button
              key={level.id}
              onClick={() => setProfile({ ...profile, fitnessLevel: level.id as any })}
              className={`w-full p-6 rounded-xl text-left transition-all ${
                profile.fitnessLevel === level.id
                  ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg'
                  : 'bg-gray-700/30 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <div className="text-xl font-bold mb-1">{level.name}</div>
              <div className="text-sm opacity-80">{level.description}</div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: 'What equipment do you have?',
      description: 'Select what you have access to',
      content: (
        <div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {equipmentOptions.map(equip => (
              <button
                key={equip.id}
                onClick={() => {
                  const updated = profile.equipment.includes(equip.id)
                    ? profile.equipment.filter(e => e !== equip.id)
                    : [...profile.equipment, equip.id];
                  setProfile({ ...profile, equipment: updated });
                }}
                className={`p-4 rounded-xl text-center transition-all ${
                  profile.equipment.includes(equip.id)
                    ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                    : 'bg-gray-700/30 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <div className="text-3xl mb-1">{equip.icon}</div>
                <div className="text-sm">{equip.name}</div>
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Days available per week</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <button
                  key={day}
                  onClick={() => setProfile({ ...profile, availableDays: day })}
                  className={`w-12 h-12 rounded-xl transition-all ${
                    profile.availableDays === day
                      ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                      : 'bg-gray-700/30 text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'You\'re all set!',
      description: 'Let\'s start your fitness journey',
      content: (
        <div className="text-center py-8">
          <div className="text-8xl mb-6">🎉</div>
          <h3 className="text-2xl font-bold text-white mb-4">Ready to crush your goals!</h3>
          <p className="text-gray-400 mb-8">
            Based on your profile, we'll create personalized workouts and nutrition plans
          </p>
          <div className="bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-xl p-6 mb-6">
            <h4 className="text-teal-400 font-semibold mb-2">Your Profile Summary</h4>
            <div className="text-sm text-gray-300">
              <p>🎯 Goal: {goals.find(g => g.id === profile.primaryGoal)?.name}</p>
              <p>📊 Level: {profile.fitnessLevel}</p>
              <p>🏋️ Equipment: {profile.equipment.length} items</p>
              <p>📅 {profile.availableDays} days/week available</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 mx-1 rounded-full transition-all ${
                  i <= step ? 'bg-gradient-to-r from-teal-500 to-blue-500' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          <div className="text-center text-gray-400 text-sm">Step {step + 1} of {steps.length}</div>
        </div>

        {/* Content */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
          <h2 className="text-2xl font-bold text-white mb-2">{steps[step].title}</h2>
          <p className="text-gray-400 mb-6">{steps[step].description}</p>
          
          {steps[step].content}

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
              className="px-6 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Back
            </button>
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all"
              >
                Start My Journey 🚀
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
