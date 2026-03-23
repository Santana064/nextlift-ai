import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../hooks/useToast';

const Social: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('feed');
  const [newPost, setNewPost] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<{id: number, name: string} | null>(null);
  const [messageText, setMessageText] = useState('');

  const [posts, setPosts] = useState([
    {
      id: 1,
      user: 'John Doe',
      avatar: 'JD',
      time: '2 hours ago',
      content: 'Just completed 100 squats! New personal record! 💪',
      likes: 24,
      comments: 5,
      liked: false
    },
    {
      id: 2,
      user: 'Sarah Smith',
      avatar: 'SS',
      time: '5 hours ago',
      content: 'Great workout session today. Form is really improving! 🔥',
      likes: 18,
      comments: 3,
      liked: true
    },
    {
      id: 3,
      user: 'Mike Johnson',
      avatar: 'MJ',
      time: '1 day ago',
      content: 'Joined the 30-day challenge. Who\'s with me? 🏋️',
      likes: 32,
      comments: 8,
      liked: false
    }
  ]);

  const [friends, setFriends] = useState([
    { id: 1, name: 'John Doe', avatar: 'JD', status: 'online', mutual: 5, isFriend: true },
    { id: 2, name: 'Sarah Smith', avatar: 'SS', status: 'offline', mutual: 3, isFriend: true },
    { id: 3, name: 'Mike Johnson', avatar: 'MJ', status: 'online', mutual: 8, isFriend: true },
    { id: 4, name: 'Emma Wilson', avatar: 'EW', status: 'online', mutual: 2, isFriend: false },
    { id: 5, name: 'Alex Brown', avatar: 'AB', status: 'offline', mutual: 4, isFriend: false }
  ]);

  const [challenges, setChallenges] = useState([
    { id: 1, name: '30-Day Streak', participants: 234, daysLeft: 12, icon: '🔥', color: 'from-orange-500 to-red-500', joined: false },
    { id: 2, name: '1000 Reps', participants: 156, daysLeft: 5, icon: '💪', color: 'from-teal-500 to-blue-500', joined: true },
    { id: 3, name: 'Weight Loss', participants: 89, daysLeft: 18, icon: '⚖️', color: 'from-green-500 to-teal-500', joined: false }
  ]);

  const leaderboard = [
    { rank: 1, name: 'John Doe', points: 2450, avatar: 'JD' },
    { rank: 2, name: 'Sarah Smith', points: 2320, avatar: 'SS' },
    { rank: 3, name: 'Mike Johnson', points: 2180, avatar: 'MJ' },
    { rank: 4, name: 'Emma Wilson', points: 1950, avatar: 'EW' },
    { rank: 5, name: 'Alex Brown', points: 1820, avatar: 'AB' }
  ];

  const tabs = [
    { id: 'feed', label: 'Feed', icon: '📱' },
    { id: 'friends', label: 'Friends', icon: '👥' },
    { id: 'challenges', label: 'Challenges', icon: '🏆' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '📊' }
  ];

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newLiked = !post.liked;
        return {
          ...post,
          liked: newLiked,
          likes: newLiked ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    }));
    showToast('success', 'Post liked!');
  };

  const handleComment = (postId: number) => {
    showToast('info', 'Comments feature coming soon!');
  };

  const handleAddFriend = (friendId: number) => {
    setFriends(friends.map(f => {
      if (f.id === friendId) {
        return { ...f, isFriend: true };
      }
      return f;
    }));
    showToast('success', 'Friend request sent!');
  };

  const handleMessage = (friendName: string, friendId: number) => {
    setSelectedFriend({ id: friendId, name: friendName });
    setShowMessageModal(true);
  };

  const handleJoinChallenge = (challengeId: number) => {
    setChallenges(challenges.map(c => {
      if (c.id === challengeId) {
        return { ...c, joined: !c.joined };
      }
      return c;
    }));
    showToast('success', challengeId ? 'Challenge joined!' : 'Challenge left!');
  };

  const handleCreatePost = () => {
    if (!newPost.trim()) {
      showToast('error', 'Please write something to post');
      return;
    }
    
    const newPostObj = {
      id: posts.length + 1,
      user: 'You',
      avatar: 'YO',
      time: 'Just now',
      content: newPost,
      likes: 0,
      comments: 0,
      liked: false
    };
    
    setPosts([newPostObj, ...posts]);
    setNewPost('');
    showToast('success', 'Post created!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Social Hub
            </span>
          </h1>
          <p className="text-gray-400">Connect with friends and join challenges</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-medium ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
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
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {activeTab === 'feed' && (
            <>
              {/* Main Feed */}
              <div className="lg:col-span-2 space-y-6">
                {/* Create Post */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share your workout achievement..."
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleCreatePost}
                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
                    >
                      Post
                    </button>
                  </div>
                </div>

                {/* Posts */}
                {posts.map((post) => (
                  <div key={post.id} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {post.avatar}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{post.user}</h3>
                        <p className="text-xs text-gray-400">{post.time}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4">{post.content}</p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1 transition-all ${post.liked ? 'text-pink-400' : 'text-gray-400 hover:text-pink-400'}`}
                      >
                        <span className="text-xl">{post.liked ? '❤️' : '🤍'}</span>
                        <span>{post.likes}</span>
                      </button>
                      <button
                        onClick={() => handleComment(post.id)}
                        className="flex items-center gap-1 text-gray-400 hover:text-purple-400 transition-all"
                      >
                        <span className="text-xl">💬</span>
                        <span>{post.comments}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Friend Suggestions */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-bold text-white mb-4">Friend Suggestions</h3>
                  <div className="space-y-3">
                    {friends.filter(f => !f.isFriend).slice(0, 3).map((friend) => (
                      <div key={friend.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs">
                            {friend.avatar}
                          </div>
                          <div>
                            <p className="text-white text-sm">{friend.name}</p>
                            <p className="text-xs text-gray-400">{friend.mutual} mutual friends</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddFriend(friend.id)}
                          className="text-xs px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full hover:bg-purple-500/30 transition-all"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trending Challenges */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-bold text-white mb-4">Trending Challenges</h3>
                  <div className="space-y-3">
                    {challenges.map((challenge) => (
                      <div key={challenge.id} className={`bg-gradient-to-br ${challenge.color}/10 rounded-xl p-4 cursor-pointer hover:scale-105 transition-all`}
                           onClick={() => handleJoinChallenge(challenge.id)}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{challenge.icon}</span>
                          <span className="text-white font-semibold">{challenge.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">{challenge.participants} participants</span>
                          <span className="text-purple-400">{challenge.daysLeft} days left</span>
                        </div>
                        {challenge.joined && (
                          <div className="mt-2 text-xs text-green-400">✓ You've joined</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'friends' && (
            <div className="lg:col-span-3">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-2xl font-bold text-white mb-6">Friends</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends.map((friend) => (
                    <div key={friend.id} className="bg-gray-700/30 rounded-xl p-4 flex items-center justify-between hover:bg-gray-700/50 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {friend.avatar}
                          </div>
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'} border-2 border-gray-800`}></div>
                        </div>
                        <div>
                          <p className="text-white font-semibold">{friend.name}</p>
                          <p className="text-xs text-gray-400">{friend.mutual} mutual friends</p>
                        </div>
                      </div>
                      {friend.isFriend ? (
                        <button
                          onClick={() => handleMessage(friend.name, friend.id)}
                          className="text-xs px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full hover:bg-purple-500/30 transition-all"
                        >
                          Message
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddFriend(friend.id)}
                          className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded-full hover:bg-green-500/30 transition-all"
                        >
                          Add Friend
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'challenges' && (
            <div className="lg:col-span-3">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-2xl font-bold text-white mb-6">Active Challenges</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {challenges.map((challenge) => (
                    <div key={challenge.id} className={`bg-gradient-to-br ${challenge.color}/10 rounded-xl p-6 border border-${challenge.color.split('-')[1]}-500/30 hover:scale-105 transition-all`}>
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-4xl">{challenge.icon}</span>
                        {challenge.joined && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">✓ Joined</span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{challenge.name}</h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Participants:</span>
                          <span className="text-white">{challenge.participants}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Days Left:</span>
                          <span className="text-white">{challenge.daysLeft}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleJoinChallenge(challenge.id)}
                          className={`flex-1 py-2 rounded-lg transition-all ${
                            challenge.joined
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                          }`}
                        >
                          {challenge.joined ? '✓ Joined' : 'Join Challenge'}
                        </button>
                        
                        <button
                          onClick={() => showToast('info', `More details about ${challenge.name} coming soon!`)}
                          className="px-3 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 transition-all"
                        >
                          📖
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="lg:col-span-3">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-2xl font-bold text-white mb-6">Leaderboard</h2>
                <div className="space-y-3">
                  {leaderboard.map((user) => (
                    <div key={user.rank} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all cursor-pointer"
                         onClick={() => showToast('info', `View ${user.name}'s profile`)}>
                      <div className="flex items-center gap-4">
                        <span className={`text-2xl font-bold ${
                          user.rank === 1 ? 'text-yellow-400' :
                          user.rank === 2 ? 'text-gray-300' :
                          user.rank === 3 ? 'text-orange-400' :
                          'text-gray-400'
                        }`}>#{user.rank}</span>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {user.avatar}
                        </div>
                        <span className="text-white font-semibold">{user.name}</span>
                      </div>
                      <span className="text-purple-400 font-bold">{user.points} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Message Modal */}
      {showMessageModal && selectedFriend && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              Message to {selectedFriend.name}
            </h3>
            
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 mb-4"
            />
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (messageText.trim()) {
                    showToast('success', `Message sent to ${selectedFriend.name}!`);
                    setMessageText('');
                    setShowMessageModal(false);
                    setSelectedFriend(null);
                  } else {
                    showToast('error', 'Please enter a message');
                  }
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600"
              >
                Send Message
              </button>
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setSelectedFriend(null);
                  setMessageText('');
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Social;
