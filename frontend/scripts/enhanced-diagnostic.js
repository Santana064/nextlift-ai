import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const results = {
  timestamp: new Date().toISOString(),
  errors: []
};

function findLineNumber(content, searchString, startFrom = 0) {
  const lines = content.split('\n');
  for (let i = startFrom; i < lines.length; i++) {
    if (lines[i].includes(searchString)) {
      return i + 1;
    }
  }
  return 'N/A';
}

function checkUnbalancedTags(content, filePath) {
  const lines = content.split('\n');
  let openCount = 0;
  let closeCount = 0;
  let problematicLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Count opening tags (but not self-closing)
    const opens = (line.match(/<[A-Za-z][^>/]*>/g) || []).length;
    // Count closing tags
    const closes = (line.match(/<\/[^>]+>/g) || []).length;
    
    openCount += opens;
    closeCount += closes;
    
    // If we have more closes than opens at any point, something's wrong
    if (closeCount > openCount) {
      problematicLines.push({
        line: i + 1,
        content: line.trim(),
        openSoFar: openCount,
        closeSoFar: closeCount
      });
    }
  }

  if (openCount !== closeCount) {
    results.errors.push({
      file: filePath,
      type: 'Unbalanced JSX tags',
      open: openCount,
      close: closeCount,
      difference: Math.abs(openCount - closeCount),
      problematicLines: problematicLines,
      suggestion: openCount > closeCount 
        ? `Add ${openCount - closeCount} closing tags at the end` 
        : `Remove ${closeCount - openCount} extra closing tags`
    });
  }
}

function checkUnclosedQuotes(content, filePath) {
  const lines = content.split('\n');
  let inString = false;
  let stringStartLine = 0;
  let quoteChar = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      // Check for string start/end
      if ((char === "'" || char === '"') && (j === 0 || line[j-1] !== '\\')) {
        if (!inString) {
          inString = true;
          stringStartLine = i + 1;
          quoteChar = char;
        } else if (char === quoteChar) {
          inString = false;
        }
      }
    }
  }

  if (inString) {
    results.errors.push({
      file: filePath,
      type: 'Unclosed quote',
      line: stringStartLine,
      quoteChar: quoteChar
    });
  }
}

// Check all problematic files
const filesToCheck = [
  'src/App.tsx',
  'src/main.tsx',
  'src/pages/Login.tsx',
  'src/context/AuthContext.tsx',
  'src/context/ToastContext.tsx',
  'src/context/ThemeContext.tsx'
];

filesToCheck.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️ File not found: ${filePath}`);
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  checkUnbalancedTags(content, filePath);
  checkUnclosedQuotes(content, filePath);
});

// Print results
console.log('\n📊 ENHANCED DIAGNOSTIC REPORT');
console.log('==============================');

if (results.errors.length === 0) {
  console.log('✅ No errors found!');
} else {
  results.errors.forEach(error => {
    console.log(`\n❌ ${error.file}:`);
    console.log(`   Type: ${error.type}`);
    
    if (error.type === 'Unbalanced JSX tags') {
      console.log(`   Open tags: ${error.open}`);
      console.log(`   Close tags: ${error.close}`);
      console.log(`   Need to: ${error.suggestion}`);
      if (error.problematicLines.length > 0) {
        console.log(`   First issue at line ${error.problematicLines[0].line}:`);
        console.log(`     ${error.problematicLines[0].content}`);
      }
    } else if (error.type === 'Unclosed quote') {
      console.log(`   Line: ${error.line}`);
      console.log(`   Quote character: ${error.quoteChar}`);
    }
  });
}

console.log('\n📁 Full report saved to: enhanced-diagnostic.json');
fs.writeFileSync('enhanced-diagnostic.json', JSON.stringify(results, null, 2));
