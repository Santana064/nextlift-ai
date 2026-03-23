import fs from 'fs';
import path from 'path';

console.log('\x1b[36m🔍 TESTING EXPORTS VS IMPORTS...\x1b[0m\n');

const results = { passed: 0, failed: 0, tests: [] };

// Map of files and what they should export
const expectedExports = {
  './src/context/AuthContext.tsx': ['AuthContext', 'AuthProvider', 'useAuth'],
  './src/context/ToastContext.tsx': ['ToastContext', 'ToastProvider', 'useToast'],
  './src/context/ThemeContext.tsx': ['ThemeContext', 'ThemeProvider', 'useTheme'],
};

Object.entries(expectedExports).forEach(([filePath, expected]) => {
  if (!fs.existsSync(filePath)) {
    console.log(`\x1b[31m❌ FAIL: ${filePath} does not exist\x1b[0m`);
    results.failed++;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const missing = [];
  
  expected.forEach(exp => {
    const patterns = [
      `export const ${exp}`,
      `export function ${exp}`,
      `export { ${exp}`,
      `export default ${exp}`
    ];
    
    const found = patterns.some(p => content.includes(p));
    if (!found) {
      missing.push(exp);
    }
  });
  
  if (missing.length === 0) {
    console.log(`\x1b[32m✅ PASS: ${filePath} exports all expected\x1b[0m`);
    results.passed++;
  } else {
    console.log(`\x1b[31m❌ FAIL: ${filePath} missing: ${missing.join(', ')}\x1b[0m`);
    results.failed++;
  }
});

console.log(`\n\x1b[36m📊 EXPORT TEST RESULTS: ${results.passed} passed, ${results.failed} failed\x1b[0m`);
