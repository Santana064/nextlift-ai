import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const endpoints = [
  // Auth
  { method: 'POST', url: '/auth/login', data: { email: 'demo@nextlift.ai', password: 'demo123' } },
  { method: 'GET', url: '/auth/profile', auth: true },
  
  // Workouts
  { method: 'GET', url: '/workouts', auth: true },
  { method: 'GET', url: '/workouts/history', auth: true },
  { method: 'GET', url: '/workouts/stats', auth: true },
  { method: 'POST', url: '/workouts', auth: true, data: { exerciseType: 'squat', reps: 10, sets: 3, duration: 300 } },
  
  // Analytics
  { method: 'GET', url: '/analytics/dashboard', auth: true },
  { method: 'GET', url: '/analytics/workouts', auth: true },
  { method: 'GET', url: '/analytics/progress', auth: true },
  { method: 'GET', url: '/analytics/achievements', auth: true },
  { method: 'GET', url: '/analytics/streaks', auth: true },
  
  // Social
  { method: 'GET', url: '/social/feed', auth: true },
  { method: 'GET', url: '/social/friends', auth: true },
  { method: 'GET', url: '/social/challenges', auth: true },
  
  // Nutrition
  { method: 'GET', url: '/nutrition/daily', auth: true },
  { method: 'GET', url: '/nutrition/meal-plan', auth: true }
];

async function testEndpoints() {
  console.log('\x1b[36m%s\x1b[0m', '🔍 TESTING ALL API ENDPOINTS...\n');
  
  try {
    // Login first to get token
    const login = await axios.post(`${API_URL}/auth/login`, {
      email: 'demo@nextlift.ai',
      password: 'demo123'
    });
    const token = login.data.token;
    console.log('✅ Login successful - token received\n');
    
    let passed = 0;
    let failed = 0;
    
    for (const endpoint of endpoints) {
      try {
        const config = {
          method: endpoint.method,
          url: `${API_URL}${endpoint.url}`,
          headers: {}
        };
        
        if (endpoint.auth && token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        if (endpoint.data && (endpoint.method === 'POST' || endpoint.method === 'PUT')) {
          config.data = endpoint.data;
        }
        
        const response = await axios(config);
        console.log(`✅ ${endpoint.method} ${endpoint.url} - ${response.status}`);
        passed++;
      } catch (error) {
        const status = error.response?.status || 'ERROR';
        const message = error.response?.data?.message || error.message;
        console.log(`❌ ${endpoint.method} ${endpoint.url} - ${status} (${message})`);
        failed++;
      }
    }
    
    console.log('\n\x1b[33m%s\x1b[0m', '📊 RESULTS:');
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📊 Total: ${passed + failed}`);
    
  } catch (error) {
    console.log('\x1b[31m%s\x1b[0m', '❌ Failed to login - backend may not be running!');
    console.log('   Make sure backend is running on port 5000');
  }
}

testEndpoints();
