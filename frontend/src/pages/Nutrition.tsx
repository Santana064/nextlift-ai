import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import FoodSearch from '../components/FoodSearch';

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealType: string;
  brand?: string;
  createdAt: string;
}

const Nutrition: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [water, setWater] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [newMeal, setNewMeal] = useState({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    mealType: 'breakfast'
  });

  const waterGoal = 8;
  const caloriesGoal = 2000;
  const proteinGoal = 150;
  const carbsGoal = 200;
  const fatsGoal = 65;

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mealsRes, waterRes] = await Promise.all([
        api.get('/nutrition/meals/today'),
        api.get('/nutrition/water/today')
      ]);
      
      setMeals(mealsRes.data.data || []);
      setWater(waterRes.data.data?.total || 0);
    } catch (error) {
      console.error('Failed to load nutrition data:', error);
      showToast('error', 'Failed to load nutrition data');
    } finally {
      setLoading(false);
    }
  };

  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = meals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalFats = meals.reduce((sum, m) => sum + (m.fats || 0), 0);

  const addMeal = async () => {
    if (!newMeal.name) {
      showToast('error', 'Please enter a meal name');
      return;
    }
    if (newMeal.calories <= 0) {
      showToast('error', 'Please enter valid calories');
      return;
    }

    try {
      const response = await api.post('/nutrition/meals', newMeal);
      setMeals([response.data.data, ...meals]);
      setNewMeal({ name: '', calories: 0, protein: 0, carbs: 0, fats: 0, mealType: 'breakfast' });
      setShowAddMeal(false);
      showToast('success', 'Meal added successfully!');
    } catch (error) {
      console.error('Failed to add meal:', error);
      showToast('error', 'Failed to add meal');
    }
  };

  const deleteMeal = async (id: string) => {
    try {
      await api.delete(`/nutrition/meals/${id}`);
      setMeals(meals.filter(m => m.id !== id));
      showToast('info', 'Meal removed');
    } catch (error) {
      console.error('Failed to delete meal:', error);
      showToast('error', 'Failed to delete meal');
    }
  };

  const addWater = async () => {
    if (water >= waterGoal) {
      showToast('info', 'Water goal already reached!');
      return;
    }
    
    try {
      await api.post('/nutrition/water', { amount: 1 });
      setWater(water + 1);
      showToast('success', 'Water intake updated!');
    } catch (error) {
      console.error('Failed to add water:', error);
      showToast('error', 'Failed to add water');
    }
  };

  const resetWater = async () => {
    try {
      await api.delete('/nutrition/water/reset');
      setWater(0);
      showToast('info', 'Water intake reset');
    } catch (error) {
      console.error('Failed to reset water:', error);
      showToast('error', 'Failed to reset water');
    }
  };

  const handleFoodSearchSelect = (food: any) => {
    setNewMeal({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats,
      mealType: food.mealType || 'snack'
    });
    setShowAddMeal(true);
    setShowFoodSearch(false);
    showToast('success', `Added: ${food.name}`);
  };

  const resetAllData = async () => {
    if (confirm('Reset all nutrition data for today? This cannot be undone.')) {
      try {
        await Promise.all([
          ...meals.map(m => api.delete(`/nutrition/meals/${m.id}`)),
          api.delete('/nutrition/water/reset')
        ]);
        setMeals([]);
        setWater(0);
        showToast('success', 'All data reset for today');
      } catch (error) {
        console.error('Failed to reset data:', error);
        showToast('error', 'Failed to reset data');
      }
    }
  };

  const getMealTypeIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case 'breakfast': return '🍳';
      case 'lunch': return '🍱';
      case 'dinner': return '🍽️';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const stats = [
    { label: 'Calories', current: totalCalories, goal: caloriesGoal, unit: 'kcal', icon: '🔥', color: 'from-orange-500 to-red-500' },
    { label: 'Protein', current: totalProtein, goal: proteinGoal, unit: 'g', icon: '🥩', color: 'from-red-500 to-pink-500' },
    { label: 'Carbs', current: totalCarbs, goal: carbsGoal, unit: 'g', icon: '🍚', color: 'from-yellow-500 to-orange-500' },
    { label: 'Fats', current: totalFats, goal: fatsGoal, unit: 'g', icon: '🥑', color: 'from-green-500 to-teal-500' }
  ];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                  Nutrition Tracker
                </span>
              </h1>
              <p className="text-gray-400">Track your daily nutrition and water intake</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-500">📅 {today}</p>
                <span className="text-xs text-gray-600">•</span>
                <p className="text-sm text-gray-500">👤 {user?.name || 'User'}</p>
              </div>
            </div>
            <button
              onClick={resetAllData}
              className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm transition-all"
            >
              Reset Today
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const percentage = Math.min(100, Math.round((stat.current / stat.goal) * 100));
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-br ${stat.color}/10 rounded-2xl p-6 border border-${stat.color.split('-')[1]}-500/30 backdrop-blur-sm hover:scale-105 transition-transform cursor-pointer`}
                onClick={() => showToast('info', `${stat.label}: ${stat.current}/${stat.goal}${stat.unit}`)}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{stat.icon}</span>
                  <span className={`text-2xl font-bold text-${stat.color.split('-')[1]}-400`}>{percentage}%</span>
                </div>
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-white text-xl font-bold">
                  {stat.current} <span className="text-sm text-gray-400">/ {stat.goal}{stat.unit}</span>
                </p>
                <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className={`h-full bg-gradient-to-r ${stat.color}`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Water Intake */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Water Intake</h2>
            <span className="text-3xl">💧</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">{water} / {waterGoal} glasses</span>
                <span className="text-blue-400">{Math.round((water / waterGoal) * 100)}%</span>
              </div>
              <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(water / waterGoal) * 100}%` }}
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-400"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addWater}
                disabled={water >= waterGoal}
                className="px-6 py-3 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +1 Glass
              </button>
              <button
                onClick={resetWater}
                className="px-4 py-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </motion.div>

        {/* Meals Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Today's Meals</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFoodSearch(true)}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <span>🔍</span>
                Search Food
              </button>
              <button
                onClick={() => setShowAddMeal(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all transform hover:scale-105"
              >
                + Add Meal
              </button>
            </div>
          </div>

          {showAddMeal && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-gray-700/30 rounded-xl border border-gray-600"
            >
              <h3 className="text-white font-semibold mb-4">Add New Meal</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Meal name"
                  value={newMeal.name}
                  onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                  className="col-span-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <select
                  value={newMeal.mealType}
                  onChange={(e) => setNewMeal({ ...newMeal, mealType: e.target.value })}
                  className="col-span-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="breakfast">Breakfast 🍳</option>
                  <option value="lunch">Lunch 🍱</option>
                  <option value="dinner">Dinner 🍽️</option>
                  <option value="snack">Snack 🍎</option>
                </select>
                <input
                  type="number"
                  placeholder="Calories"
                  value={newMeal.calories || ''}
                  onChange={(e) => setNewMeal({ ...newMeal, calories: parseInt(e.target.value) || 0 })}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="number"
                  placeholder="Protein (g)"
                  value={newMeal.protein || ''}
                  onChange={(e) => setNewMeal({ ...newMeal, protein: parseInt(e.target.value) || 0 })}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="number"
                  placeholder="Carbs (g)"
                  value={newMeal.carbs || ''}
                  onChange={(e) => setNewMeal({ ...newMeal, carbs: parseInt(e.target.value) || 0 })}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="number"
                  placeholder="Fats (g)"
                  value={newMeal.fats || ''}
                  onChange={(e) => setNewMeal({ ...newMeal, fats: parseInt(e.target.value) || 0 })}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addMeal}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                >
                  Save Meal
                </button>
                <button
                  onClick={() => setShowAddMeal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {meals.length > 0 ? (
            <div className="space-y-3">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30 flex justify-between items-center hover:bg-gray-700/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getMealTypeIcon(meal.mealType)}</span>
                    <div>
                      <div className="font-semibold text-white">{meal.name}</div>
                      <div className="text-sm text-gray-400">
                        {meal.calories} kcal | P:{meal.protein}g C:{meal.carbs}g F:{meal.fats}g
                      </div>
                      <div className="text-xs text-gray-500">{formatTime(meal.createdAt)}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMeal(meal.id)}
                    className="text-red-400 hover:text-red-300 hover:scale-110 transition-all"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <p className="text-gray-400">No meals added yet</p>
              <p className="text-sm text-gray-500 mt-2">Search for food or add manually</p>
              <p className="text-xs text-gray-600 mt-1">Your meals are saved to your account</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Food Search Modal */}
      {showFoodSearch && (
        <FoodSearch
          onSelect={handleFoodSearchSelect}
          onClose={() => setShowFoodSearch(false)}
        />
      )}
    </div>
  );
};

export default Nutrition;
