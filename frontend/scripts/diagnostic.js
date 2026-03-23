import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const results = {
  timestamp: new Date().toISOString(),
  missingExports: [],
  syntaxErrors: [],
  importErrors: [],
  files: {}
};

function checkFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️ File not found: ${filePath}`);
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const relativePath = filePath;
  
  results.files[relativePath] = {
    exports: [],
    imports: [],
    hasJSX: content.includes('return (') || content.includes('<div'),
    lineCount: content.split('\n').length,
    content: content.substring(0, 500) + '...' // First 500 chars for reference
  };
  
  // Check for exports
  const exportMatches = content.match(/export (const|function|default|class) (\w+)/g) || [];
  results.files[relativePath].exports = exportMatches.map(e => e.replace('export ', ''));
  
  // Check for empty/default export issues
  if (content.includes('export default ;')) {
    results.syntaxErrors.push({ file: relativePath, error: 'Empty export default', line: findLineNumber(content, 'export default ;') });
  }
  
  if (content.match(/export const :/)) {
    results.syntaxErrors.push({ file: relativePath, error: 'Invalid export const :', line: findLineNumber(content, 'export const :') });
  }
  
  // Check for unclosed JSX
  const openTags = (content.match(/<[A-Za-z][^>]*>/g) || []).length;
  const closeTags = (content.match(/<\/[^>]+>/g) || []).length;
  if (openTags !== closeTags) {
    results.syntaxErrors.push({ 
      file: relativePath, 
      error: `Unbalanced JSX tags: ${openTags} open, ${closeTags} close`,
      line: 'N/A'
    });
  }
  
  // Check for unclosed quotes
  const singleQuotes = (content.match(/'/g) || []).length;
  const doubleQuotes = (content.match(/"/g) || []).length;
  if (singleQuotes % 2 !== 0) {
    results.syntaxErrors.push({ file: relativePath, error: 'Unclosed single quote', line: 'N/A' });
  }
  if (doubleQuotes % 2 !== 0) {
    results.syntaxErrors.push({ file: relativePath, error: 'Unclosed double quote', line: 'N/A' });
  }
}

function findLineNumber(content, searchString) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchString)) {
      return i + 1;
    }
  }
  return 'N/A';
}

// Critical files to check
const criticalFiles = [
  'src/App.tsx',
  'src/main.tsx',
  'src/routes.ts',
  'src/pages/Login.tsx',
  'src/pages/Register.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/Workout.tsx',
  'src/context/AuthContext.tsx',
  'src/context/ToastContext.tsx',
  'src/context/ThemeContext.tsx',
  'src/hooks/useAuth.ts',
  'src/hooks/useToast.ts',
  'src/hooks/useWorkout.ts',
  'src/hooks/useAI.ts',
  'src/hooks/useAnalytics.ts',
  'src/hooks/useProgress.ts',
  'src/hooks/useNutrition.ts',
  'src/hooks/useSocial.ts',
  'src/hooks/useProfile.ts'
];

criticalFiles.forEach(checkFile);

// Write report
fs.writeFileSync('diagnostic-report.json', JSON.stringify(results, null, 2));

console.log('\n📊 DIAGNOSTIC REPORT');
console.log('====================');
console.log(`Total files checked: ${Object.keys(results.files).length}`);
console.log(`Syntax errors: ${results.syntaxErrors.length}`);

if (results.syntaxErrors.length > 0) {
  console.log('\n❌ SYNTAX ERRORS:');
  results.syntaxErrors.forEach(e => {
    console.log(`  ${e.file}:${e.line} - ${e.error}`);
  });
} else {
  console.log('\n✅ No syntax errors found!');
}

console.log('\n📁 Full report saved to: diagnostic-report.json');
console.log('\n📄 File exports summary:');
Object.entries(results.files).forEach(([file, data]) => {
  console.log(`\n${file}:`);
  console.log(`  Exports: ${data.exports.length > 0 ? data.exports.join(', ') : 'None'}`);
  console.log(`  Lines: ${data.lineCount}`);
});
