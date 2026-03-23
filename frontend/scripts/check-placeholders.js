import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const placeholderPatterns = [
  /placeholder/i,
  /Placeholder/i,
  /"This is a placeholder/i,
  /'This is a placeholder'/i,
  /TODO/i,
  /FIXME/i,
  /"Coming soon"/i,
  /'Coming soon'/i,
  /"Under construction"/i,
  /'Under construction'/i
];

const dirs = ['./src/pages', './src/components'];
let placeholderCount = 0;
const filesWithPlaceholders = [];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    if (file.endsWith('.tsx')) {
      const filePath = path.join(dir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      placeholderPatterns.forEach(pattern => {
        const match = content.match(pattern);
        if (match) {
          console.log(`⚠️  ${dir}/${file} contains: "${match[0]}"`);
          placeholderCount++;
          filesWithPlaceholders.push(`${dir}/${file}`);
        }
      });
    }
  });
});

console.log('\n\x1b[33m%s\x1b[0m', '📊 PLACEHOLDER SUMMARY:');
if (placeholderCount === 0) {
  console.log('\x1b[32m%s\x1b[0m', '✅ NO PLACEHOLDER TEXT FOUND! All pages are real!');
} else {
  console.log(`\x1b[31m❌ Found ${placeholderCount} instances of placeholder text in:\x1b[0m`);
  [...new Set(filesWithPlaceholders)].forEach(f => console.log(`   📁 ${f}`));
}
