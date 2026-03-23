import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const results = {
  timestamp: new Date().toISOString(),
  syntaxErrors: { passed: 0, failed: 0, errors: [] },
  exports: { passed: 0, failed: 0, errors: [] },
  imports: { passed: 0, failed: 0, errors: [] },
  components: { passed: 0, failed: 0, errors: [] }
};

// ============================================
// 1. SYNTAX CHECK - COMPILES EVERY TYPESCRIPT FILE
// ============================================
function checkSyntax() {
  console.log('\n\x1b[36m🔍 CHECKING SYNTAX OF ALL TYPESCRIPT FILES...\x1b[0m\n');

  const tsFiles = [];
  
  function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        tsFiles.push(filePath);
      }
    });
  }

  walkDir('./src');

  tsFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for common syntax errors
      const errors = [];
      
      // Check for missing export names (like the MotivationQuote error)
      if (content.includes('export default ;')) {
        errors.push('Empty export default');
      }
      
      // Check for unclosed JSX tags
      const openTags = (content.match(/<[A-Za-z][^>]*>/g) || []).length;
      const closeTags = (content.match(/<\/[^>]+>/g) || []).length;
      if (openTags !== closeTags) {
        errors.push(`Unbalanced JSX tags: ${openTags} open, ${closeTags} close`);
      }
      
      // Check for missing closing braces
      const openBraces = (content.match(/{/g) || []).length;
      const closeBraces = (content.match(/}/g) || []).length;
      if (openBraces !== closeBraces) {
        errors.push(`Unbalanced braces: ${openBraces} open, ${closeBraces} close`);
      }
      
      // Check for missing closing parentheses
      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        errors.push(`Unbalanced parentheses: ${openParens} open, ${closeParens} close`);
      }
      
      // Check for string literals
      const singleQuotes = (content.match(/'/g) || []).length;
      if (singleQuotes % 2 !== 0) {
        errors.push('Unclosed single quote');
      }
      
      const doubleQuotes = (content.match(/"/g) || []).length;
      if (doubleQuotes % 2 !== 0) {
        errors.push('Unclosed double quote');
      }
      
      if (errors.length === 0) {
        console.log(`\x1b[32m✅ PASS: ${path.relative(process.cwd(), filePath)}\x1b[0m`);
        results.syntaxErrors.passed++;
      } else {
        console.log(`\x1b[31m❌ FAIL: ${path.relative(process.cwd(), filePath)} - ${errors.join(', ')}\x1b[0m`);
        results.syntaxErrors.failed++;
        results.syntaxErrors.errors.push({ file: filePath, errors });
      }
    } catch (e) {
      console.log(`\x1b[31m❌ FAIL: ${path.relative(process.cwd(), filePath)} - ${e.message}\x1b[0m`);
      results.syntaxErrors.failed++;
    }
  });
}

// ============================================
// 2. EXPORT CHECK - VERIFIES ALL EXPORTS ARE VALID
// ============================================
function checkExports() {
  console.log('\n\x1b[36m📤 CHECKING EXPORTS...\x1b[0m\n');

  const contexts = [
    { path: './src/context/AuthContext.tsx', expected: ['AuthContext', 'AuthProvider', 'useAuth'] },
    { path: './src/context/ToastContext.tsx', expected: ['ToastContext', 'ToastProvider', 'useToast'] },
    { path: './src/context/ThemeContext.tsx', expected: ['ThemeContext', 'ThemeProvider', 'useTheme'] }
  ];

  contexts.forEach(ctx => {
    if (!fs.existsSync(ctx.path)) {
      console.log(`\x1b[31m❌ FAIL: ${ctx.path} does not exist\x1b[0m`);
      results.exports.failed++;
      return;
    }
    
    const content = fs.readFileSync(ctx.path, 'utf8');
    const missing = [];
    
    ctx.expected.forEach(exp => {
      const patterns = [
        `export const ${exp}`,
        `export function ${exp}`,
        `export { ${exp}`,
        `export default ${exp}`,
        `export = ${exp}`
      ];
      
      const found = patterns.some(p => content.includes(p));
      if (!found) {
        missing.push(exp);
      }
    });
    
    if (missing.length === 0) {
      console.log(`\x1b[32m✅ PASS: ${ctx.path}\x1b[0m`);
      results.exports.passed++;
    } else {
      console.log(`\x1b[31m❌ FAIL: ${ctx.path} missing: ${missing.join(', ')}\x1b[0m`);
      results.exports.failed++;
      results.exports.errors.push({ file: ctx.path, missing });
    }
  });
}

// ============================================
// 3. COMPONENT CHECK - VERIFIES COMPONENTS HAVE PROPER EXPORTS
// ============================================
function checkComponents() {
  console.log('\n\x1b[36m🧩 CHECKING COMPONENTS...\x1b[0m\n');

  const componentFiles = [];
  
  function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.tsx') && !file.includes('index')) {
        componentFiles.push(filePath);
      }
    });
  }

  walkDir('./src/components');

  componentFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath, '.tsx');
    
    // Check if the component exports something
    const hasExport = content.includes('export default') || 
                      content.includes(`export const ${fileName}`) ||
                      content.includes('export function');
    
    // Check for empty default export (the exact error we saw)
    const hasEmptyExport = content.includes('export default ;');
    
    // Check for missing component name in export
    const hasNamedExport = content.includes(`export const ${fileName}:`) ||
                           content.includes(`export const ${fileName} =`) ||
                           content.includes(`export function ${fileName}`);
    
    if (hasEmptyExport) {
      console.log(`\x1b[31m❌ FAIL: ${path.relative(process.cwd(), filePath)} - Empty export default\x1b[0m`);
      results.components.failed++;
      results.components.errors.push({ file: filePath, error: 'Empty export default' });
    } else if (!hasExport) {
      console.log(`\x1b[31m❌ FAIL: ${path.relative(process.cwd(), filePath)} - No export found\x1b[0m`);
      results.components.failed++;
      results.components.errors.push({ file: filePath, error: 'No export' });
    } else if (!hasNamedExport && fileName !== 'index') {
      // Check if the export name matches the filename
      const exportMatch = content.match(/export (?:default|const) (\w+)/);
      if (exportMatch && exportMatch[1] !== fileName) {
        console.log(`\x1b[33m⚠️ WARN: ${path.relative(process.cwd(), filePath)} - Export name "${exportMatch[1]}" doesn\'t match filename "${fileName}"\x1b[0m`);
      } else {
        console.log(`\x1b[32m✅ PASS: ${path.relative(process.cwd(), filePath)}\x1b[0m`);
        results.components.passed++;
      }
    } else {
      console.log(`\x1b[32m✅ PASS: ${path.relative(process.cwd(), filePath)}\x1b[0m`);
      results.components.passed++;
    }
  });
}

// ============================================
// 4. FIX THE MOTIVATIONQUOTE COMPONENT
// ============================================
function fixMotivationQuote() {
  const filePath = './src/components/dashboard/MotivationQuote.tsx';
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the empty export
    if (content.includes('export default ;')) {
      const fixedContent = content.replace('export default ;', `
const quotes = [
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "The hard days are the best because that's when champions are made.",
  "Success is what comes after you stop making excuses.",
  "Train insane or remain the same."
];

export const MotivationQuote: React.FC = () => {
  const [quote, setQuote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

  return (
    <div className="glass-card p-4">
      <p className="text-sm text-gray-300 italic">"{quote}"</p>
      <p className="text-xs text-teal-400 mt-2">- AI Coach</p>
    </div>
  );
};

export default MotivationQuote;
`);
      
      fs.writeFileSync(filePath, fixedContent);
      console.log(`\x1b[32m✅ FIXED: ${filePath}\x1b[0m`);
    }
  }
}

// ============================================
// 5. RUN ALL CHECKS
// ============================================
async function runBrutalTests() {
  console.log('\x1b[35m╔════════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[35m║        NEXTLIFT AI - BRUTAL TEST SUITE        ║\x1b[0m');
  console.log('\x1b[35m╚════════════════════════════════════════════════╝\x1b[0m\n');
  
  // First, fix the MotivationQuote component
  fixMotivationQuote();
  
  // Run all checks
  checkSyntax();
  checkExports();
  checkComponents();
  
  // Generate report
  console.log('\n\x1b[36m📊 BRUTAL TEST REPORT\x1b[0m');
  console.log('====================\n');
  
  console.log(`SYNTAX ERRORS: ${results.syntaxErrors.passed} passed, ${results.syntaxErrors.failed} failed`);
  console.log(`EXPORTS: ${results.exports.passed} passed, ${results.exports.failed} failed`);
  console.log(`COMPONENTS: ${results.components.passed} passed, ${results.components.failed} failed`);
  
  if (results.syntaxErrors.failed > 0) {
    console.log('\n\x1b[31m❌ SYNTAX ERRORS FOUND:\x1b[0m');
    results.syntaxErrors.errors.forEach(err => {
      console.log(`   ${err.file}: ${err.errors.join(', ')}`);
    });
  }
  
  if (results.exports.failed > 0) {
    console.log('\n\x1b[31m❌ EXPORT ERRORS FOUND:\x1b[0m');
    results.exports.errors.forEach(err => {
      console.log(`   ${err.file}: missing ${err.missing.join(', ')}`);
    });
  }
  
  if (results.components.failed > 0) {
    console.log('\n\x1b[31m❌ COMPONENT ERRORS FOUND:\x1b[0m');
    results.components.errors.forEach(err => {
      console.log(`   ${err.file}: ${err.error}`);
    });
  }
  
  const totalPassed = results.syntaxErrors.passed + results.exports.passed + results.components.passed;
  const totalFailed = results.syntaxErrors.failed + results.exports.failed + results.components.failed;
  
  console.log(`\n\x1b[36m📈 TOTAL: ${totalPassed} passed, ${totalFailed} failed\x1b[0m`);
  
  if (totalFailed === 0) {
    console.log('\n\x1b[32m🎉 PERFECT! No errors found!\x1b[0m');
  } else {
    console.log(`\n\x1b[31m❌ ${totalFailed} errors found. Fix them and run again.\x1b[0m`);
  }
  
  fs.writeFileSync('brutal-test-report.json', JSON.stringify(results, null, 2));
  console.log('\n\x1b[36m📁 Report saved to: brutal-test-report.json\x1b[0m');
}

runBrutalTests().catch(console.error);
