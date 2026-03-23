import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentsDir = './src/components';
const pagesDir = './src/pages';

const buttonActions = {
  'onClick': 0,
  'href': 0,
  'to': 0,
  'submit': 0,
  'empty': 0
};

const filesWithEmptyButtons = [];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  let inButton = false;
  let buttonText = '';
  let hasAction = false;

  lines.forEach((line, index) => {
    // Check for button tags
    if (line.includes('<button') || line.includes('Button ')) {
      inButton = true;
      buttonText = '';
      hasAction = false;

      // Check for actions in the same line
      if (line.includes('onClick=') ||
          line.includes('href=') ||
          line.includes('to=') ||
          line.includes('type="submit"')) {
        hasAction = true;
        if (line.includes('onClick=')) buttonActions['onClick']++;
        if (line.includes('href=')) buttonActions['href']++;
        if (line.includes('to=')) buttonActions['to']++;
        if (line.includes('type="submit"')) buttonActions['submit']++;
      }
    }

    // Check for actions in following lines
    if (inButton && !hasAction) {
      if (line.includes('onClick=') ||
          line.includes('href=') ||
          line.includes('to=') ||
          line.includes('type="submit"')) {
        hasAction = true;
        if (line.includes('onClick=')) buttonActions['onClick']++;
        if (line.includes('href=')) buttonActions['href']++;
        if (line.includes('to=')) buttonActions['to']++;
        if (line.includes('type="submit"')) buttonActions['submit']++;
      }
    }

    // Capture button text
    if (inButton && line.includes('>') && !line.includes('</button>')) {
      const textMatch = line.match(/>([^<]+)</);
      if (textMatch) {
        buttonText = textMatch[1].trim();
      }
    }

    // Check closing button
    if (inButton && (line.includes('</button>') || line.includes('/>'))) {
      if (!hasAction) {
        buttonActions['empty']++;
        filesWithEmptyButtons.push({
          file: filePath,
          line: index + 1,
          text: buttonText || 'Unnamed button'
        });
      }
      inButton = false;
    }
  });
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      checkFile(filePath);
    }
  });
}

// Check components and pages
console.log('\x1b[36m%s\x1b[0m', '🔍 SCANNING FOR BUTTONS...\n');

if (fs.existsSync(componentsDir)) walkDir(componentsDir);
if (fs.existsSync(pagesDir)) walkDir(pagesDir);

console.log('\x1b[33m%s\x1b[0m', '📊 BUTTON ACTION SUMMARY:');
console.log(`✅ Buttons with onClick: ${buttonActions['onClick']}`);
console.log(`✅ Buttons with href: ${buttonActions['href']}`);
console.log(`✅ Buttons with to (React Router): ${buttonActions['to']}`);
console.log(`✅ Submit buttons: ${buttonActions['submit']}`);
console.log(`❌ Empty buttons (no action): ${buttonActions['empty']}\n`);

if (filesWithEmptyButtons.length > 0) {
  console.log('\x1b[31m%s\x1b[0m', '⚠️  EMPTY BUTTONS FOUND:');
  filesWithEmptyButtons.forEach(b => {
    console.log(`   📁 ${path.relative(process.cwd(), b.file)}:${b.line} - "${b.text}"`);
  });
} else {
  console.log('\x1b[32m%s\x1b[0m', '✅ NO EMPTY BUTTONS FOUND! All buttons have actions!');
}
