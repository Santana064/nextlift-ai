import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:5174';

const results = {
  timestamp: new Date().toISOString(),
  backend: { passed: 0, failed: 0, tests: [] },
  frontend: { passed: 0, failed: 0, tests: [] },
  features: { passed: 0, failed: 0, warnings: 0, tests: [] }
};

function logResult(category, name, status, details = '') {
  const result = { name, status, details, timestamp: new Date().toISOString() };
  results[category].tests.push(result);
  
  if (status === 'PASS') {
    results[category].passed++;
    console.log(`\x1b[32m✅ PASS [${category}]: ${name}\x1b[0m`);
  } else if (status === 'WARN') {
    results[category].warnings = (results[category].warnings || 0) + 1;
    console.log(`\x1b[33m⚠️ WARN [${category}]: ${name} - ${details}\x1b[0m`);
  } else {
    results[category].failed++;
    console.log(`\x1b[31m❌ FAIL [${category}]: ${name} - ${details}\x1b[0m`);
  }
}

// ============================================
// BACKEND API TESTS
// ============================================
async function testBackend() {
  console.log('\n\x1b[36m🔧 TESTING BACKEND APIs...\x1b[0m\n');
  
  let token = '';

  // Health Check
  try {
    const health = await axios.get(`${API_URL}/health`);
    if (health.status === 200) {
      logResult('backend', 'Health Check', 'PASS');
    }
  } catch (e) {
    logResult('backend', 'Health Check', 'FAIL', 'Backend not running');
    return false;
  }

  // Login
  try {
    const login = await axios.post(`${API_URL}/auth/login`, {
      email: 'demo@nextlift.ai',
      password: 'demo123'
    });
    
    if (login.status === 200 && login.data.token) {
      logResult('backend', 'Login', 'PASS');
      token = login.data.token;
    }
  } catch (e) {
    logResult('backend', 'Login', 'FAIL', e.message);
  }

  if (!token) return false;

  // Test all authenticated endpoints
  const endpoints = [
    { name: 'Get Profile', method: 'GET', url: '/auth/profile' },
    { name: 'Get Workouts', method: 'GET', url: '/workouts' },
    { name: 'Get Workout History', method: 'GET', url: '/workouts/history' },
    { name: 'Get Workout Stats', method: 'GET', url: '/workouts/stats' },
    { name: 'Analytics Dashboard', method: 'GET', url: '/analytics/dashboard' },
    { name: 'Workout Analytics', method: 'GET', url: '/analytics/workouts' },
    { name: 'Progress Analytics', method: 'GET', url: '/analytics/progress' },
    { name: 'Achievement Analytics', method: 'GET', url: '/analytics/achievements' },
    { name: 'Streak Analytics', method: 'GET', url: '/analytics/streaks' },
    { name: 'Social Feed', method: 'GET', url: '/social/feed' },
    { name: 'Friends List', method: 'GET', url: '/social/friends' },
    { name: 'Challenges', method: 'GET', url: '/social/challenges' },
    { name: 'Daily Nutrition', method: 'GET', url: '/nutrition/daily' },
    { name: 'Meal Plan', method: 'GET', url: '/nutrition/meal-plan' }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${API_URL}${endpoint.url}`,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 200) {
        logResult('backend', endpoint.name, 'PASS');
      } else {
        logResult('backend', endpoint.name, 'WARN', `Status ${response.status}`);
      }
    } catch (e) {
      logResult('backend', endpoint.name, 'FAIL', e.message);
    }
  }

  // Test Create Workout
  try {
    const workout = await axios.post(`${API_URL}/workouts`, {
      exerciseType: 'squat',
      reps: 10,
      sets: 3,
      duration: 300
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (workout.status === 201 || workout.status === 200) {
      logResult('backend', 'Create Workout', 'PASS');
    }
  } catch (e) {
    logResult('backend', 'Create Workout', 'FAIL', e.message);
  }

  return true;
}

// ============================================
// FRONTEND PAGE TESTS
// ============================================
async function testFrontend() {
  console.log('\n\x1b[36m🖥️ TESTING FRONTEND PAGES...\x1b[0m\n');

  const pages = [
    { url: '/', name: 'Home/Dashboard' },
    { url: '/login', name: 'Login Page' },
    { url: '/register', name: 'Register Page' },
    { url: '/workout', name: 'Workout Page' },
    { url: '/analysis', name: 'Analysis Page' },
    { url: '/progress', name: 'Progress Page' },
    { url: '/nutrition', name: 'Nutrition Page' },
    { url: '/social', name: 'Social Page' },
    { url: '/profile', name: 'Profile Page' },
    { url: '/chat', name: 'Chat Page' },
    { url: '/generator', name: 'Generator Page' },
    { url: '/test', name: 'Test Page' }
  ];

  for (const page of pages) {
    try {
      const response = await axios.get(`${FRONTEND_URL}${page.url}`, {
        timeout: 5000,
        validateStatus: false
      });
      
      if (response.status === 200) {
        logResult('frontend', `${page.name}`, 'PASS');
      } else {
        logResult('frontend', `${page.name}`, 'FAIL', `Status ${response.status}`);
      }
    } catch (e) {
      if (e.code === 'ECONNREFUSED') {
        logResult('frontend', 'Frontend Server', 'FAIL', `Frontend not running on ${FRONTEND_URL}`);
        return false;
      }
      logResult('frontend', `${page.name}`, 'FAIL', e.message);
    }
  }
  return true;
}

// ============================================
// FEATURE TESTS (FIXED - NO REQUIRE)
// ============================================
async function testFeatures() {
  console.log('\n\x1b[36m✨ TESTING FEATURES...\x1b[0m\n');

  // Check if all required components exist
  const checkFileExists = (filePath) => {
    try {
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  };

  // Check components
  const components = [
    'CameraFeed.tsx',
    'PoseOverlay.tsx',
    'ErrorBoundary.tsx',
    'ProtectedRoute.tsx'
  ];

  components.forEach(comp => {
    const exists = checkFileExists(`./src/components/${comp}`);
    if (exists) {
      logResult('features', `Component: ${comp}`, 'PASS');
    } else {
      logResult('features', `Component: ${comp}`, 'FAIL', 'Missing');
    }
  });

  // Check contexts
  const contexts = [
    'AuthContext.tsx',
    'ToastContext.tsx',
    'ThemeContext.tsx'
  ];

  contexts.forEach(ctx => {
    const exists = checkFileExists(`./src/context/${ctx}`);
    if (exists) {
      logResult('features', `Context: ${ctx}`, 'PASS');
    } else {
      logResult('features', `Context: ${ctx}`, 'FAIL', 'Missing');
    }
  });

  // Check services
  const services = [
    'api.ts',
    'auth.ts'
  ];

  services.forEach(svc => {
    const exists = checkFileExists(`./src/services/${svc}`);
    if (exists) {
      logResult('features', `Service: ${svc}`, 'PASS');
    } else {
      logResult('features', `Service: ${svc}`, 'FAIL', 'Missing');
    }
  });

  // Check routes.ts
  if (checkFileExists('./src/routes.ts')) {
    logResult('features', 'Routes Configuration', 'PASS');
  } else {
    logResult('features', 'Routes Configuration', 'FAIL', 'Missing');
  }

  // Check for placeholder text in pages
  const pagesDir = './src/pages';
  const placeholderPatterns = [/placeholder/i, /TODO/i, /FIXME/i, /"Coming soon"/i];
  let placeholderCount = 0;

  if (checkFileExists(pagesDir)) {
    const pages = fs.readdirSync(pagesDir);
    pages.forEach(page => {
      if (page.endsWith('.tsx')) {
        const content = fs.readFileSync(path.join(pagesDir, page), 'utf8');
        placeholderPatterns.forEach(pattern => {
          if (pattern.test(content)) {
            logResult('features', `Placeholder in ${page}`, 'WARN', `Contains ${pattern}`);
            placeholderCount++;
          }
        });
      }
    });
  }

  if (placeholderCount === 0) {
    logResult('features', 'No Placeholder Text', 'PASS');
  }
}

// ============================================
// UI IMPROVEMENT SUGGESTIONS
// ============================================
function generateUISuggestions() {
  console.log('\n\x1b[36m💡 UI IMPROVEMENT SUGGESTIONS:\x1b[0m\n');
  
  const suggestions = [
    {
      area: 'Dashboard',
      suggestions: [
        'Add greeting based on time of day',
        'Show motivational quote of the day',
        'Add quick-add workout button',
        'Display upcoming challenges'
      ]
    },
    {
      area: 'Workout Page',
      suggestions: [
        'Add exercise video tutorials',
        'Show historical performance overlay',
        'Add rest timer between sets',
        'Implement voice countdown'
      ]
    },
    {
      area: 'Profile Page',
      suggestions: [
        'Add progress photos timeline',
        'Show fitness level badge',
        'Add social sharing buttons',
        'Implement achievement showcase'
      ]
    },
    {
      area: 'Navigation',
      suggestions: [
        'Add quick actions floating button',
        'Implement breadcrumb navigation',
        'Add keyboard shortcuts',
        'Show unread notifications badge'
      ]
    },
    {
      area: 'General UI',
      suggestions: [
        'Add dark/light theme toggle',
        'Implement smooth page transitions',
        'Add haptic feedback for mobile',
        'Create animated micro-interactions',
        'Add skeleton loading screens',
        'Implement infinite scroll for feeds',
        'Add pull-to-refresh on mobile',
        'Create onboarding tour for new users'
      ]
    }
  ];
  
  suggestions.forEach(category => {
    console.log(`\x1b[33m📌 ${category.area}:\x1b[0m`);
    category.suggestions.forEach(s => console.log(`   • ${s}`));
    console.log('');
  });
}

// ============================================
// FINAL REPORT
// ============================================
function generateReport() {
  console.log('\n\x1b[36m📊 FINAL TEST REPORT\x1b[0m');
  console.log('====================\n');
  
  const categories = ['backend', 'frontend', 'features'];
  let totalPassed = 0;
  let totalFailed = 0;
  let totalWarnings = 0;
  
  categories.forEach(cat => {
    const passed = results[cat].passed;
    const failed = results[cat].failed;
    const warnings = results[cat].warnings || 0;
    totalPassed += passed;
    totalFailed += failed;
    totalWarnings += warnings;
    
    const color = failed === 0 ? '\x1b[32m' : '\x1b[31m';
    console.log(`${color}${cat.toUpperCase()}: ${passed} passed, ${failed} failed, ${warnings} warnings\x1b[0m`);
  });
  
  console.log(`\n\x1b[36m📈 TOTAL: ${totalPassed} passed, ${totalFailed} failed, ${totalWarnings} warnings\x1b[0m`);
  
  if (totalFailed === 0 && totalWarnings === 0) {
    console.log('\n\x1b[32m🎉 PERFECT! All tests passed! Your app is production ready!\x1b[0m');
  } else if (totalFailed === 0) {
    console.log('\n\x1b[33m⚠️  Good! All critical tests passed, but has warnings.\x1b[0m');
  } else {
    console.log(`\n\x1b[31m❌ ${totalFailed} tests failed. Review the details above.\x1b[0m`);
  }
  
  // Save report
  fs.writeFileSync('ultimate-test-report.json', JSON.stringify(results, null, 2));
  console.log('\n\x1b[36m📁 Full report saved to: ultimate-test-report.json\x1b[0m');
  
  generateUISuggestions();
  
  // Calculate rating
  const totalTests = totalPassed + totalFailed;
  const score = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
  const rating = (score / 10).toFixed(1);
  
  console.log(`\n\x1b[35m═══════════════════════════════════════════\x1b[0m`);
  console.log(`\x1b[35m  OVERALL APP RATING: ${rating}/10 (${score}%)\x1b[0m`);
  console.log(`\x1b[35m═══════════════════════════════════════════\x1b[0m`);
  
  if (score >= 95) {
    console.log(`\x1b[32m  🏆 EXCEPTIONAL! Ready to launch!\x1b[0m`);
  } else if (score >= 85) {
    console.log(`\x1b[32m  🚀 Great! Minor improvements suggested.\x1b[0m`);
  } else if (score >= 70) {
    console.log(`\x1b[33m  📈 Good, but needs work before launch.\x1b[0m`);
  } else {
    console.log(`\x1b[31m  🔧 Needs significant improvement.\x1b[0m`);
  }
}

// ============================================
// MAIN EXECUTION
// ============================================
async function runTests() {
  console.log('\x1b[35m╔════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[35m║     NEXTLIFT AI - COMPREHENSIVE TESTS     ║\x1b[0m');
  console.log('\x1b[35m╚════════════════════════════════════════════╝\x1b[0m\n');
  
  const backendOk = await testBackend();
  if (backendOk) {
    await testFrontend();
  }
  await testFeatures();
  
  generateReport();
}

runTests().catch(console.error);
