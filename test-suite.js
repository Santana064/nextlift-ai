// ============================================
// COMPREHENSIVE TEST SUITE - RUN THIS ONCE
// ============================================

const axios = require('axios');
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const API_URL = 'http://localhost:5000/api';
let token = '';
let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

// ============================================
// HELPER FUNCTIONS
// ============================================
function log(message, color = 'reset') {
  console.log(colors[color], message, colors.reset);
}

function testResult(name, status, details = null) {
  const result = {
    name,
    status,
    details,
    timestamp: new Date().toISOString()
  };
  testResults.tests.push(result);
  
  if (status === 'PASS') {
    testResults.passed++;
    log(`✅ PASS: ${name}`, 'green');
  } else if (status === 'WARN') {
    testResults.warnings++;
    log(`⚠️  WARN: ${name} - ${details}`, 'yellow');
  } else {
    testResults.failed++;
    log(`❌ FAIL: ${name} - ${details}`, 'red');
  }
}

async function apiCall(method, endpoint, data = null, auth = false) {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {}
    };
    
    if (auth && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (data && (method === 'POST' || method === 'PUT')) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

// ============================================
// TEST SUITE
// ============================================
async function runTests() {
  log('\n🚀 STARTING COMPREHENSIVE TEST SUITE', 'cyan');
  log('=====================================\n', 'cyan');

  // ==========================================
  // 1. BACKEND CONNECTION TESTS
  // ==========================================
  log('\n📡 TESTING BACKEND CONNECTION...', 'blue');
  
  const health = await apiCall('GET', '/health');
  if (health.success) {
    testResult('Backend Health Check', 'PASS');
  } else {
    testResult('Backend Health Check', 'FAIL', 'Backend not running');
    log('\n❌ CRITICAL: Backend not running! Start backend first.', 'red');
    return;
  }

  // ==========================================
  // 2. AUTHENTICATION TESTS
  // ==========================================
  log('\n🔐 TESTING AUTHENTICATION...', 'blue');
  
  // Test login
  const login = await apiCall('POST', '/auth/login', {
    email: 'demo@nextlift.ai',
    password: 'demo123'
  });
  
  if (login.success) {
    testResult('Login with demo account', 'PASS');
    token = login.data.token;
    log(`   Token received: ${token.substring(0, 20)}...`, 'gray');
  } else {
    testResult('Login with demo account', 'FAIL', login.error);
  }

  // Test invalid login
  const invalidLogin = await apiCall('POST', '/auth/login', {
    email: 'wrong@email.com',
    password: 'wrongpass'
  });
  
  if (!invalidLogin.success && invalidLogin.status === 401) {
    testResult('Invalid login rejection', 'PASS');
  } else {
    testResult('Invalid login rejection', 'FAIL', 'Should return 401');
  }

  // Test register
  const testEmail = `test${Date.now()}@example.com`;
  const register = await apiCall('POST', '/auth/register', {
    email: testEmail,
    password: 'Test123456',
    name: 'Test User'
  });
  
  if (register.success) {
    testResult('User registration', 'PASS');
  } else {
    testResult('User registration', 'FAIL', register.error);
  }

  // Test profile with token
  if (token) {
    const profile = await apiCall('GET', '/auth/profile', null, true);
    if (profile.success) {
      testResult('Get profile with auth', 'PASS');
    } else {
      testResult('Get profile with auth', 'FAIL', profile.error);
    }
  }

  // ==========================================
  // 3. WORKOUT TESTS
  // ==========================================
  log('\n💪 TESTING WORKOUTS...', 'blue');
  
  if (token) {
    // Get all workouts
    const workouts = await apiCall('GET', '/workouts', null, true);
    if (workouts.success) {
      testResult('Get all workouts', 'PASS');
      log(`   Found ${workouts.data.data?.length || 0} workouts`, 'gray');
    } else {
      testResult('Get all workouts', 'FAIL', workouts.error);
    }

    // Get workout history
    const history = await apiCall('GET', '/workouts/history', null, true);
    if (history.success) {
      testResult('Get workout history', 'PASS');
    } else {
      testResult('Get workout history', 'WARN', 'Endpoint may not exist');
    }

    // Get workout stats
    const stats = await apiCall('GET', '/workouts/stats', null, true);
    if (stats.success) {
      testResult('Get workout stats', 'PASS');
    } else {
      testResult('Get workout stats', 'WARN', 'Endpoint may not exist');
    }

    // Create new workout
    const newWorkout = await apiCall('POST', '/workouts', {
      exerciseType: 'squat',
      reps: 30,
      sets: 3,
      duration: 300,
      caloriesBurned: 120,
      formScore: 85
    }, true);
    
    if (newWorkout.success) {
      testResult('Create workout', 'PASS');
    } else {
      testResult('Create workout', 'FAIL', newWorkout.error);
    }
  }

  // ==========================================
  // 4. ANALYTICS TESTS
  // ==========================================
  log('\n📊 TESTING ANALYTICS...', 'blue');
  
  if (token) {
    const dashboard = await apiCall('GET', '/analytics/dashboard', null, true);
    if (dashboard.success) {
      testResult('Analytics dashboard', 'PASS');
      log(`   Stats: ${JSON.stringify(dashboard.data.data)}`, 'gray');
    } else {
      testResult('Analytics dashboard', 'FAIL', dashboard.error);
    }

    const workouts = await apiCall('GET', '/analytics/workouts?timeframe=month', null, true);
    if (workouts.success) {
      testResult('Workout analytics', 'PASS');
    } else {
      testResult('Workout analytics', 'WARN', 'Endpoint may not exist');
    }

    const progress = await apiCall('GET', '/analytics/progress', null, true);
    if (progress.success) {
      testResult('Progress analytics', 'PASS');
    } else {
      testResult('Progress analytics', 'WARN', 'Endpoint may not exist');
    }

    const achievements = await apiCall('GET', '/analytics/achievements', null, true);
    if (achievements.success) {
      testResult('Achievement analytics', 'PASS');
    } else {
      testResult('Achievement analytics', 'WARN', 'Endpoint may not exist');
    }

    const streaks = await apiCall('GET', '/analytics/streaks', null, true);
    if (streaks.success) {
      testResult('Streak analytics', 'PASS');
    } else {
      testResult('Streak analytics', 'WARN', 'Endpoint may not exist');
    }
  }

  // ==========================================
  // 5. USER TESTS
  // ==========================================
  log('\n👤 TESTING USER ENDPOINTS...', 'blue');
  
  if (token) {
    // Get user profile (assuming we have a user ID)
    const users = await apiCall('GET', '/workouts', null, true);
    if (users.success && users.data.data?.length > 0) {
      const userId = users.data.data[0].userId;
      
      const userProfile = await apiCall('GET', `/users/${userId}`, null, true);
      if (userProfile.success) {
        testResult('Get user profile', 'PASS');
      } else {
        testResult('Get user profile', 'WARN', 'User endpoint may not exist');
      }

      const userStats = await apiCall('GET', `/users/${userId}/stats`, null, true);
      if (userStats.success) {
        testResult('Get user stats', 'PASS');
      } else {
        testResult('Get user stats', 'WARN', 'User stats endpoint may not exist');
      }
    }
  }

  // ==========================================
  // 6. SOCIAL TESTS
  // ==========================================
  log('\n👥 TESTING SOCIAL FEATURES...', 'blue');
  
  if (token) {
    const feed = await apiCall('GET', '/social/feed', null, true);
    if (feed.success) {
      testResult('Get social feed', 'PASS');
    } else {
      testResult('Get social feed', 'WARN', 'Social endpoints may not be implemented');
    }

    const friends = await apiCall('GET', '/social/friends', null, true);
    if (friends.success) {
      testResult('Get friends', 'PASS');
    } else {
      testResult('Get friends', 'WARN', 'Friends endpoint may not exist');
    }

    const challenges = await apiCall('GET', '/social/challenges', null, true);
    if (challenges.success) {
      testResult('Get challenges', 'PASS');
    } else {
      testResult('Get challenges', 'WARN', 'Challenges endpoint may not exist');
    }
  }

  // ==========================================
  // 7. NUTRITION TESTS
  // ==========================================
  log('\n🥗 TESTING NUTRITION...', 'blue');
  
  if (token) {
    const daily = await apiCall('GET', '/nutrition/daily', null, true);
    if (daily.success) {
      testResult('Get daily nutrition', 'PASS');
    } else {
      testResult('Get daily nutrition', 'WARN', 'Nutrition endpoints may not exist');
    }

    const mealPlan = await apiCall('GET', '/nutrition/meal-plan', null, true);
    if (mealPlan.success) {
      testResult('Get meal plan', 'PASS');
    } else {
      testResult('Get meal plan', 'WARN', 'Meal plan endpoint may not exist');
    }
  }

  // ==========================================
  // 8. FRONTEND PAGE TESTS
  // ==========================================
  log('\n🖥️  TESTING FRONTEND PAGES...', 'blue');
  
  const pages = [
    { url: 'http://localhost:5173', name: 'Home/Dashboard' },
    { url: 'http://localhost:5173/login', name: 'Login Page' },
    { url: 'http://localhost:5173/register', name: 'Register Page' },
    { url: 'http://localhost:5173/workout', name: 'Workout Page' },
    { url: 'http://localhost:5173/analysis', name: 'Analysis Page' },
    { url: 'http://localhost:5173/progress', name: 'Progress Page' },
    { url: 'http://localhost:5173/nutrition', name: 'Nutrition Page' },
    { url: 'http://localhost:5173/social', name: 'Social Page' },
    { url: 'http://localhost:5173/profile', name: 'Profile Page' },
    { url: 'http://localhost:5173/chat', name: 'Chat Page' },
    { url: 'http://localhost:5173/generator', name: 'Generator Page' },
    { url: 'http://localhost:5173/test', name: 'Test Page' },
    { url: 'http://localhost:5173/404', name: '404 Page' }
  ];

  for (const page of pages) {
    try {
      const response = await axios.get(page.url, { timeout: 3000 });
      if (response.status === 200) {
        testResult(`Frontend: ${page.name}`, 'PASS');
      } else {
        testResult(`Frontend: ${page.name}`, 'FAIL', `Status ${response.status}`);
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        testResult(`Frontend: ${page.name}`, 'FAIL', 'Frontend not running (start with: npm run dev)');
      } else {
        testResult(`Frontend: ${page.name}`, 'FAIL', error.message);
      }
    }
  }

  // ==========================================
  // FINAL REPORT
  // ==========================================
  log('\n📋 FINAL TEST REPORT', 'cyan');
  log('==================', 'cyan');
  log(`✅ PASSED: ${testResults.passed}`, 'green');
  log(`⚠️  WARNINGS: ${testResults.warnings}`, 'yellow');
  log(`❌ FAILED: ${testResults.failed}`, 'red');
  log(`📊 TOTAL TESTS: ${testResults.tests.length}`, 'blue');
  
  log('\n🔍 DETAILED BREAKDOWN:', 'cyan');
  testResults.tests.forEach(test => {
    const icon = test.status === 'PASS' ? '✅' : test.status === 'WARN' ? '⚠️' : '❌';
    const color = test.status === 'PASS' ? 'green' : test.status === 'WARN' ? 'yellow' : 'red';
    log(`   ${icon} ${test.name}`, color);
  });

  // Save report to file
  const fs = require('fs');
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      passed: testResults.passed,
      warnings: testResults.warnings,
      failed: testResults.failed,
      total: testResults.tests.length
    },
    tests: testResults.tests
  };
  
  fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
  log('\n📁 Test report saved to: test-report.json', 'cyan');
  
  if (testResults.failed === 0 && testResults.warnings === 0) {
    log('\n🎉 PERFECT! ALL TESTS PASSED! Your app is 100% working!', 'green');
  } else if (testResults.failed === 0) {
    log('\n⚠️  GOOD! All critical tests passed, but some non-critical features have warnings.', 'yellow');
  } else {
    log('\n❌ Some tests failed. Check the report above for details.', 'red');
  }
}

// ============================================
// RUN TESTS
// ============================================
runTests().catch(error => {
  console.error('Test suite error:', error);
});
