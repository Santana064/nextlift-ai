import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:5174';

const results = {
  timestamp: new Date().toISOString(),
  fileStructure: { passed: 0, failed: 0, tests: [] },
  imports: { passed: 0, failed: 0, tests: [] },
  backend: { passed: 0, failed: 0, tests: [] },
  frontend: { passed: 0, failed: 0, tests: [] },
  functionality: { passed: 0, failed: 0, tests: [] }
};

function logResult(category, name, status, details = '') {
  const result = { name, status, details, timestamp: new Date().toISOString() };
  results[category].tests.push(result);
  
  if (status === 'PASS') {
    results[category].passed++;
    console.log(`\x1b[32m✅ PASS [${category}]: ${name}\x1b[0m`);
  } else if (status === 'WARN') {
    console.log(`\x1b[33m⚠️ WARN [${category}]: ${name} - ${details}\x1b[0m`);
  } else {
    results[category].failed++;
    console.log(`\x1b[31m❌ FAIL [${category}]: ${name} - ${details}\x1b[0m`);
  }
}

// ============================================
// 1. FILE STRUCTURE TESTS
// ============================================
function testFileStructure() {
  console.log('\n\x1b[36m📁 TESTING FILE STRUCTURE...\x1b[0m\n');

  const requiredFiles = [
    // Core files
    { path: './src/main.tsx', name: 'Main entry file' },
    { path: './src/App.tsx', name: 'App component' },
    { path: './src/index.css', name: 'Global styles' },
    { path: './src/routes.ts', name: 'Routes configuration' },
    { path: './vite.config.ts', name: 'Vite config' },
    { path: './tailwind.config.js', name: 'Tailwind config' },
    { path: './postcss.config.js', name: 'PostCSS config' },
    { path: './index.html', name: 'HTML entry' },
    
    // Pages
    { path: './src/pages/Login.tsx', name: 'Login page' },
    { path: './src/pages/Register.tsx', name: 'Register page' },
    { path: './src/pages/Dashboard.tsx', name: 'Dashboard page' },
    { path: './src/pages/Workout.tsx', name: 'Workout page' },
    { path: './src/pages/Analysis.tsx', name: 'Analysis page' },
    { path: './src/pages/Progress.tsx', name: 'Progress page' },
    { path: './src/pages/Nutrition.tsx', name: 'Nutrition page' },
    { path: './src/pages/Social.tsx', name: 'Social page' },
    { path: './src/pages/Profile.tsx', name: 'Profile page' },
    { path: './src/pages/Chat.tsx', name: 'Chat page' },
    { path: './src/pages/Generator.tsx', name: 'Generator page' },
    { path: './src/pages/Test.tsx', name: 'Test page' },
    { path: './src/pages/NotFound.tsx', name: 'Not Found page' },
    { path: './src/pages/LoadingPage.tsx', name: 'Loading page' },
    
    // Components
    { path: './src/components/CameraFeed.tsx', name: 'Camera Feed component' },
    { path: './src/components/PoseOverlay.tsx', name: 'Pose Overlay component' },
    { path: './src/components/ErrorBoundary.tsx', name: 'Error Boundary component' },
    { path: './src/components/ProtectedRoute.tsx', name: 'Protected Route component' },
    { path: './src/components/Navigation/Navbar.tsx', name: 'Navbar component' },
    { path: './src/components/Auth/ProtectedRoute.tsx', name: 'Auth Protected Route' },
    
    // Contexts
    { path: './src/context/AuthContext.tsx', name: 'Auth Context' },
    { path: './src/context/ToastContext.tsx', name: 'Toast Context' },
    { path: './src/context/ThemeContext.tsx', name: 'Theme Context' },
    
    // Hooks (THIS WAS MISSING!)
    { path: './src/hooks/useAuth.ts', name: 'useAuth hook' },
    { path: './src/hooks/useToast.ts', name: 'useToast hook' },
    { path: './src/hooks/useWorkout.ts', name: 'useWorkout hook' },
    { path: './src/hooks/useAI.ts', name: 'useAI hook' },
    { path: './src/hooks/useProgress.ts', name: 'useProgress hook' },
    { path: './src/hooks/useNutrition.ts', name: 'useNutrition hook' },
    { path: './src/hooks/useSocial.ts', name: 'useSocial hook' },
    { path: './src/hooks/useAnalytics.ts', name: 'useAnalytics hook' },
    { path: './src/hooks/useProfile.ts', name: 'useProfile hook' },
    
    // Services
    { path: './src/services/api.ts', name: 'API service' },
    { path: './src/services/auth.ts', name: 'Auth service' }
  ];

  requiredFiles.forEach(file => {
    const exists = fs.existsSync(file.path);
    if (exists) {
      logResult('fileStructure', file.name, 'PASS');
    } else {
      logResult('fileStructure', file.name, 'FAIL', `Missing: ${file.path}`);
    }
  });
}

// ============================================
// 2. IMPORT TESTS (Check all files for broken imports)
// ============================================
function testImports() {
  console.log('\n\x1b[36m🔍 TESTING IMPORTS...\x1b[0m\n');

  const tsxFiles = [];
  
  // Recursively get all .tsx files
  function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        tsxFiles.push(filePath);
      }
    });
  }

  walkDir('./src');

  tsxFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    let hasError = false;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      // Skip node_modules imports
      if (importPath.startsWith('react') || 
          importPath.startsWith('framer-motion') ||
          importPath.startsWith('axios') ||
          importPath.startsWith('@')) {
        continue;
      }
      
      // Resolve relative imports
      if (importPath.startsWith('.')) {
        const baseDir = path.dirname(filePath);
        let resolvedPath;
        
        if (importPath.endsWith('/*')) continue;
        
        // Try with .tsx, .ts, .jsx, .js
        const extensions = ['.tsx', '.ts', '.jsx', '.js', ''];
        let found = false;
        
        for (const ext of extensions) {
          const testPath = path.resolve(baseDir, importPath + ext);
          if (fs.existsSync(testPath)) {
            found = true;
            break;
          }
          
          // Try as directory with index file
          const indexTestPath = path.resolve(baseDir, importPath, `index${ext}`);
          if (fs.existsSync(indexTestPath)) {
            found = true;
            break;
          }
        }
        
        if (!found) {
          hasError = true;
          logResult('imports', `${path.relative(process.cwd(), filePath)} -> ${importPath}`, 'FAIL', 'Import not found');
        }
      }
    }
    
    if (!hasError) {
      logResult('imports', path.relative(process.cwd(), filePath), 'PASS');
    }
  });
}

// ============================================
// 3. BACKEND API TESTS
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
// 4. FRONTEND PAGE LOAD TESTS
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
// 5. FUNCTIONALITY TESTS
// ============================================
function testFunctionality() {
  console.log('\n\x1b[36m⚡ TESTING FUNCTIONALITY...\x1b[0m\n');

  // Check if all context providers are used correctly
  const appContent = fs.readFileSync('./src/App.tsx', 'utf8');
  
  if (appContent.includes('AuthProvider') && 
      appContent.includes('ToastProvider') && 
      appContent.includes('ThemeProvider')) {
    logResult('functionality', 'Context Providers', 'PASS');
  } else {
    logResult('functionality', 'Context Providers', 'FAIL', 'Missing providers');
  }

  // Check if ProtectedRoute is used
  if (appContent.includes('ProtectedRoute')) {
    logResult('functionality', 'Protected Routes', 'PASS');
  } else {
    logResult('functionality', 'Protected Routes', 'FAIL', 'No route protection');
  }

  // Check if ErrorBoundary is used
  if (appContent.includes('ErrorBoundary')) {
    logResult('functionality', 'Error Handling', 'PASS');
  } else {
    logResult('functionality', 'Error Handling', 'FAIL', 'No error boundary');
  }

  // Check if all routes are defined
  const routesContent = fs.readFileSync('./src/routes.ts', 'utf8');
  const requiredRoutes = [
    'LOGIN', 'REGISTER', 'DASHBOARD', 'WORKOUT', 'ANALYSIS',
    'PROGRESS', 'NUTRITION', 'CHAT', 'PROFILE', 'SOCIAL', 'GENERATOR'
  ];
  
  let allRoutesFound = true;
  requiredRoutes.forEach(route => {
    if (!routesContent.includes(route)) {
      allRoutesFound = false;
      logResult('functionality', `Route: ${route}`, 'FAIL', 'Missing');
    }
  });
  
  if (allRoutesFound) {
    logResult('functionality', 'Route Definitions', 'PASS');
  }

  // Check for proper API integration
  const apiContent = fs.readFileSync('./src/services/api.ts', 'utf8');
  if (apiContent.includes('baseURL') && apiContent.includes('interceptors')) {
    logResult('functionality', 'API Configuration', 'PASS');
  } else {
    logResult('functionality', 'API Configuration', 'FAIL', 'Incomplete API setup');
  }

  // Check for authentication flow
  const authServiceContent = fs.readFileSync('./src/services/auth.ts', 'utf8');
  if (authServiceContent.includes('login') && 
      authServiceContent.includes('register') && 
      authServiceContent.includes('logout')) {
    logResult('functionality', 'Auth Service', 'PASS');
  } else {
    logResult('functionality', 'Auth Service', 'FAIL', 'Incomplete auth');
  }
}

// ============================================
// FINAL REPORT
// ============================================
function generateReport() {
  console.log('\n\x1b[36m📊 FINAL TEST REPORT\x1b[0m');
  console.log('====================\n');
  
  const categories = ['fileStructure', 'imports', 'backend', 'frontend', 'functionality'];
  let totalPassed = 0;
  let totalFailed = 0;
  
  categories.forEach(cat => {
    const passed = results[cat].passed;
    const failed = results[cat].failed;
    totalPassed += passed;
    totalFailed += failed;
    
    const color = failed === 0 ? '\x1b[32m' : '\x1b[31m';
    console.log(`${color}${cat.toUpperCase()}: ${passed} passed, ${failed} failed\x1b[0m`);
  });
  
  console.log(`\n\x1b[36m📈 TOTAL: ${totalPassed} passed, ${totalFailed} failed\x1b[0m`);
  
  if (totalFailed === 0) {
    console.log('\n\x1b[32m🎉 PERFECT! All tests passed! Your app is production ready!\x1b[0m');
  } else {
    console.log(`\n\x1b[31m❌ ${totalFailed} tests failed. Review the details above.\x1b[0m`);
  }
  
  // Save report
  fs.writeFileSync('ultimate-comprehensive-report.json', JSON.stringify(results, null, 2));
  console.log('\n\x1b[36m📁 Full report saved to: ultimate-comprehensive-report.json\x1b[0m');
}

// ============================================
// MAIN EXECUTION
// ============================================
async function runTests() {
  console.log('\x1b[35m╔════════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[35m║   NEXTLIFT AI - ULTIMATE COMPREHENSIVE TEST   ║\x1b[0m');
  console.log('\x1b[35m╚════════════════════════════════════════════════╝\x1b[0m\n');
  
  // Run all tests
  testFileStructure();
  testImports();
  const backendOk = await testBackend();
  if (backendOk) {
    await testFrontend();
  }
  testFunctionality();
  
  generateReport();
}

runTests().catch(console.error);
