// Run this in browser console to populate test data

const testUsers = [
  {
    name: 'Demo User',
    email: 'demo@nextlift.ai',
    password: 'demo123',
    fitnessLevel: 'intermediate'
  },
  {
    name: 'John Fitness',
    email: 'john@example.com',
    password: 'password123',
    fitnessLevel: 'advanced'
  },
  {
    name: 'Sarah Health',
    email: 'sarah@example.com',
    password: 'password123',
    fitnessLevel: 'beginner'
  }
];

const testWorkouts = [
  {
    exerciseType: 'squat',
    reps: 30,
    sets: 3,
    duration: 300,
    formScore: 85,
    caloriesBurned: 120
  },
  {
    exerciseType: 'bench_press',
    reps: 24,
    sets: 3,
    duration: 360,
    formScore: 78,
    caloriesBurned: 98
  },
  {
    exerciseType: 'deadlift',
    reps: 15,
    sets: 3,
    duration: 240,
    formScore: 92,
    caloriesBurned: 150
  },
  {
    exerciseType: 'push_up',
    reps: 50,
    sets: 5,
    duration: 400,
    formScore: 88,
    caloriesBurned: 110
  },
  {
    exerciseType: 'pull_up',
    reps: 20,
    sets: 4,
    duration: 350,
    formScore: 82,
    caloriesBurned: 130
  }
];

// Function to populate test data
async function populateTestData() {
  console.log('🚀 Starting test data population...');
  
  // Login as demo user
  const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'demo@nextlift.ai',
      password: 'demo123'
    })
  });
  
  const { token } = await loginResponse.json();
  
  if (!token) {
    console.log('❌ Please login first or register test users');
    return;
  }
  
  // Add test workouts
  for (const workout of testWorkouts) {
    const response = await fetch('http://localhost:5000/api/workouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...workout,
        completedAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString()
      })
    });
    
    if (response.ok) {
      console.log(`✅ Added workout: ${workout.exerciseType}`);
    }
  }
  
  console.log('🎉 Test data population complete!');
  console.log('📊 You now have 5+ workouts to analyze');
}

// Run this in browser console after logging in
// populateTestData();
