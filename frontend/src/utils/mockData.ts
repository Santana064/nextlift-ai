export const mockWorkouts = [
  {
    id: '1',
    exerciseType: 'squat',
    reps: 30,
    sets: 3,
    duration: 300,
    formScore: 85,
    caloriesBurned: 120,
    completedAt: new Date().toISOString()
  },
  {
    id: '2',
    exerciseType: 'bench_press',
    reps: 24,
    sets: 3,
    duration: 360,
    formScore: 78,
    caloriesBurned: 98,
    completedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    exerciseType: 'deadlift',
    reps: 15,
    sets: 3,
    duration: 240,
    formScore: 92,
    caloriesBurned: 150,
    completedAt: new Date(Date.now() - 172800000).toISOString()
  }
];

export const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe',
    fitnessLevel: 'intermediate',
    points: 2500
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith',
    fitnessLevel: 'advanced',
    points: 5000
  }
];

export const mockPosts = [
  {
    id: '1',
    userId: '1',
    user: mockUsers[0],
    content: 'Just hit a new PR on squats! 100kg for 5 reps! 🏋️',
    type: 'workout',
    likes: [{ userId: '2', userName: 'Jane Smith' }],
    comments: [],
    shares: 1,
    createdAt: new Date().toISOString()
  }
];

export const mockAchievements = [
  {
    id: '1',
    name: 'First Workout',
    description: 'Completed your first workout',
    icon: '🎯',
    category: 'workout',
    rarity: 'common',
    points: 100
  },
  {
    id: '2',
    name: 'Strength Builder',
    description: 'Lifted over 1000kg total',
    icon: '💪',
    category: 'strength',
    rarity: 'rare',
    points: 500
  }
];

export const mockChallenges = [
  {
    id: '1',
    name: '30-Day Squat Challenge',
    description: 'Complete squats for 30 days straight',
    participants: 150,
    endDate: new Date(Date.now() + 2592000000).toISOString(),
    reward: 'Squat Master Badge'
  }
];
