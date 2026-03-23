import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    height: '175',
    weight: '75',
    age: '28',
    fitnessLevel: 'intermediate'
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'history', label: 'History', icon: '📋' },
    { id: 'measurements', label: 'Measurements', icon: '📏' },
    { id: 'referrals', label: 'Referrals', icon: '🤝' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const handleSave = () => {
    setIsEditing(false);
    showToast('success', 'Profile updated successfully!');
  };

  const handleChangePassword = () => {
    if (passwordData.new !== passwordData.confirm) {
      showToast('error', 'New passwords do not match');
      return;
    }
    if (passwordData.new.length < 6) {
      showToast('error', 'Password must be at least 6 characters');
      return;
    }
    showToast('success', 'Password changed successfully!');
    setShowPasswordModal(false);
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  const handleUpdateNotifications = () => {
    showToast('success', 'Notification preferences updated!');
    setShowNotificationsModal(false);
  };

  const handleUpdatePrivacy = () => {
    showToast('success', 'Privacy settings updated!');
    setShowPrivacyModal(false);
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
    showToast('success', 'Logged out successfully');
  };

  const stats = [
    { label: 'Workouts', value: '47', icon: '💪', change: '+12 this month', color: 'from-teal-500 to-blue-500' },
    { label: 'Total Minutes', value: '1,245', icon: '⏱️', change: '+245 this week', color: 'from-blue-500 to-purple-500' },
    { label: 'Calories Burned', value: '8,450', icon: '🔥', change: '+950 this month', color: 'from-orange-500 to-red-500' },
    { label: 'Avg Form Score', value: '87%', icon: '🎯', change: '+5% improvement', color: 'from-purple-500 to-pink-500' }
  ];

  const achievements = [
    { name: 'First Workout', icon: '🎯', date: 'Jan 15, 2024', color: 'from-teal-500 to-blue-500', unlocked: true },
    { name: '7 Day Streak', icon: '🔥', date: 'Jan 22, 2024', color: 'from-orange-500 to-red-500', unlocked: true },
    { name: 'Perfect Form', icon: '💯', date: 'Feb 1, 2024', color: 'from-green-500 to-teal-500', unlocked: true },
    { name: '50 Workouts', icon: '🏋️', date: 'Mar 10, 2024', color: 'from-purple-500 to-pink-500', unlocked: true },
    { name: '100 Hours', icon: '⏱️', date: 'Locked', color: 'from-gray-500 to-gray-600', unlocked: false },
    { name: 'Elite Athlete', icon: '👑', date: 'Locked', color: 'from-gray-500 to-gray-600', unlocked: false }
  ];

  const measurements = [
    { date: 'Mar 1, 2024', chest: '102', waist: '82', arms: '36', thighs: '58' },
    { date: 'Feb 1, 2024', chest: '101', waist: '83', arms: '35', thighs: '57' },
    { date: 'Jan 1, 2024', chest: '100', waist: '84', arms: '34', thighs: '56' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center text-4xl text-white font-bold">
                {user?.name?.[0] || 'U'}
              </div>
              <button 
                onClick={() => showToast('info', 'Photo upload coming soon!')}
                className="absolute bottom-0 right-0 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-800 hover:bg-gray-600 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
              >
                📷
              </button>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="text-2xl font-bold bg-gray-700 text-white px-3 py-1 rounded-lg w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Your name"
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="text-gray-400 bg-gray-700 px-3 py-1 rounded-lg w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Your email"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-white mb-1">{user?.name || 'User'}</h1>
                  <p className="text-gray-400">{user?.email}</p>
                </>
              )}
              
              <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                <div className="flex items-center gap-1 text-sm bg-gray-700/30 px-3 py-1 rounded-full">
                  <span className="text-gray-400">Height:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-16 bg-gray-700 text-white px-2 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  ) : (
                    <span className="text-white font-semibold">{formData.height} cm</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm bg-gray-700/30 px-3 py-1 rounded-full">
                  <span className="text-gray-400">Weight:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-16 bg-gray-700 text-white px-2 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  ) : (
                    <span className="text-white font-semibold">{formData.weight} kg</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm bg-gray-700/30 px-3 py-1 rounded-full">
                  <span className="text-gray-400">Age:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-16 bg-gray-700 text-white px-2 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  ) : (
                    <span className="text-white font-semibold">{formData.age}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm bg-gray-700/30 px-3 py-1 rounded-full">
                  <span className="text-gray-400">Level:</span>
                  {isEditing ? (
                    <select
                      value={formData.fitnessLevel}
                      onChange={(e) => setFormData({ ...formData, fitnessLevel: e.target.value })}
                      className="bg-gray-700 text-white px-2 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  ) : (
                    <span className="text-white font-semibold capitalize">{formData.fitnessLevel}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-lg shadow-green-500/25"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 bg-gray-700 text-white font-medium rounded-xl hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-medium rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg shadow-teal-500/25 flex items-center gap-2"
                >
                  <span>✏️</span>
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 font-medium ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg shadow-teal-500/25'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50"
        >
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>📊</span> Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div key={stat.label} className={`bg-gradient-to-br ${stat.color}/10 rounded-xl p-6 border border-${stat.color.split('-')[1]}-500/30 hover:scale-105 transition-transform cursor-pointer`}
                       onClick={() => showToast('info', `View ${stat.label} details`)}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl">{stat.icon}</span>
                      <span className={`text-2xl font-bold text-${stat.color.split('-')[1]}-400`}>{stat.value}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <p className="text-xs text-green-400 mt-2">{stat.change}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>🏆</span> Achievements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => (
                  <div 
                    key={index} 
                    className={`bg-gradient-to-br ${achievement.color}/10 rounded-xl p-6 border border-${achievement.unlocked ? achievement.color.split('-')[1] : 'gray'}-500/30 ${achievement.unlocked ? 'cursor-pointer hover:scale-105' : 'opacity-50'} transition-all`}
                    onClick={() => achievement.unlocked && showToast('success', `Achievement unlocked: ${achievement.name}`)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">{achievement.icon}</span>
                      <div>
                        <h3 className="text-white font-semibold">{achievement.name}</h3>
                        <p className="text-sm text-gray-400">{achievement.date}</p>
                      </div>
                    </div>
                    {!achievement.unlocked && (
                      <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                        <span>🔒</span> Locked
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>📋</span> Workout History
              </h2>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-400 mb-4">View your complete workout history</p>
                <button 
                  onClick={() => navigate(ROUTES.PROGRESS)}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all"
                >
                  Go to Progress Page
                </button>
              </div>
            </div>
          )}

          {activeTab === 'measurements' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>📏</span> Body Measurements
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400">Date</th>
                      <th className="text-left py-3 px-4 text-gray-400">Chest (cm)</th>
                      <th className="text-left py-3 px-4 text-gray-400">Waist (cm)</th>
                      <th className="text-left py-3 px-4 text-gray-400">Arms (cm)</th>
                      <th className="text-left py-3 px-4 text-gray-400">Thighs (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {measurements.map((m, i) => (
                      <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-700/20 cursor-pointer" onClick={() => showToast('info', `View details for ${m.date}`)}>
                        <td className="py-3 px-4 text-white">{m.date}</td>
                        <td className="py-3 px-4 text-gray-300">{m.chest}</td>
                        <td className="py-3 px-4 text-gray-300">{m.waist}</td>
                        <td className="py-3 px-4 text-gray-300">{m.arms}</td>
                        <td className="py-3 px-4 text-gray-300">{m.thighs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => showToast('info', 'Add measurement form coming soon!')}
                  className="px-4 py-2 bg-teal-500/20 text-teal-400 rounded-lg hover:bg-teal-500/30 transition-all"
                >
                  + Add New Measurement
                </button>
              </div>
            </div>
          )}

          {activeTab === 'referrals' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>🤝</span> Refer Friends
              </h2>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎁</div>
                <p className="text-gray-400 mb-4">Invite friends to join NEXTLIFT and earn rewards!</p>
                <div className="max-w-md mx-auto">
                  <div className="flex gap-2 mb-4">
                    <input 
                      type="text" 
                      value="https://nextlift.ai/refer/demo123" 
                      readOnly
                      className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText('https://nextlift.ai/refer/demo123');
                        showToast('success', 'Referral link copied!');
                      }}
                      className="px-4 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl hover:from-teal-600 hover:to-blue-600"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">You've referred 3 friends • 150 points earned</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>⚙️</span> Account Settings
              </h2>
              <div className="space-y-3 max-w-2xl">
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full text-left px-4 py-4 bg-gray-700/30 rounded-xl text-white hover:bg-gray-700/50 transition-all flex items-center justify-between group"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-2xl">🔒</span>
                    <span className="font-medium">Change Password</span>
                  </span>
                  <span className="text-gray-400 group-hover:text-white">→</span>
                </button>

                <button 
                  onClick={() => setShowNotificationsModal(true)}
                  className="w-full text-left px-4 py-4 bg-gray-700/30 rounded-xl text-white hover:bg-gray-700/50 transition-all flex items-center justify-between group"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-2xl">🔔</span>
                    <span className="font-medium">Notification Preferences</span>
                  </span>
                  <span className="text-gray-400 group-hover:text-white">→</span>
                </button>

                <button 
                  onClick={() => setShowPrivacyModal(true)}
                  className="w-full text-left px-4 py-4 bg-gray-700/30 rounded-xl text-white hover:bg-gray-700/50 transition-all flex items-center justify-between group"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-2xl">🛡️</span>
                    <span className="font-medium">Privacy Settings</span>
                  </span>
                  <span className="text-gray-400 group-hover:text-white">→</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-4 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-between group"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-2xl">🚪</span>
                    <span className="font-medium">Logout</span>
                  </span>
                  <span className="text-red-400/50 group-hover:text-red-400">→</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700"
          >
            <h3 className="text-xl font-bold text-white mb-4">Change Password</h3>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Current Password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleChangePassword}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl hover:from-teal-600 hover:to-blue-600"
                >
                  Update Password
                </button>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700"
          >
            <h3 className="text-xl font-bold text-white mb-4">Notification Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
                <span className="text-white">Workout Reminders</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-teal-500" />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
                <span className="text-white">Achievement Alerts</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-teal-500" />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
                <span className="text-white">Friend Requests</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-teal-500" />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
                <span className="text-white">Challenge Updates</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-teal-500" />
              </label>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleUpdateNotifications}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl hover:from-teal-600 hover:to-blue-600"
                >
                  Save Preferences
                </button>
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700"
          >
            <h3 className="text-xl font-bold text-white mb-4">Privacy Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
                <span className="text-white">Profile Visibility</span>
                <select className="bg-gray-700 text-white px-3 py-1 rounded-lg">
                  <option>Public</option>
                  <option>Friends Only</option>
                  <option>Private</option>
                </select>
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
                <span className="text-white">Show Workout History</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-teal-500" />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
                <span className="text-white">Share Achievements</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-teal-500" />
              </label>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleUpdatePrivacy}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl hover:from-teal-600 hover:to-blue-600"
                >
                  Save Settings
                </button>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Profile;
