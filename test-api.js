const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing NEXTLIFT AI API\n');
  
  // Test 1: Health check
  console.log('1. Testing health endpoint...');
  try {
    const health = await axios.get('http://localhost:5000/api/health');
    console.log('   ✅ Health check passed:', health.data.message);
  } catch (error) {
    console.log('   ❌ Health check failed:', error.message);
  }
  
  // Test 2: Auth endpoints
  console.log('\n2. Testing authentication...');
  try {
    const login = await axios.post(`${API_URL}/auth/login`, {
      email: 'demo@nextlift.com',
      password: 'demo123'
    });
    console.log('   ✅ Login successful');
    const token = login.data.token;
    
    // Test 3: Protected route
    console.log('\n3. Testing protected route...');
    const profile = await axios.get(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Profile fetched:', profile.data.name);
    
    // Test 4: Nutrition endpoints
    console.log('\n4. Testing nutrition endpoints...');
    const meals = await axios.get(`${API_URL}/nutrition/meals/today`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Got ${meals.data.data.length} meals today`);
    
    const water = await axios.get(`${API_URL}/nutrition/water/today`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Water intake: ${water.data.data.total} glasses`);
    
    // Test 5: Workout endpoints
    console.log('\n5. Testing workout endpoints...');
    const workouts = await axios.get(`${API_URL}/workouts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Got ${workouts.data.data.length} workouts`);
    
    const stats = await axios.get(`${API_URL}/workouts/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Stats: ${stats.data.data.totalWorkouts} total workouts`);
    
    console.log('\n🎉 All API tests passed!');
    
  } catch (error) {
    console.log('   ❌ Error:', error.response?.data?.message || error.message);
  }
}

testAPI();
