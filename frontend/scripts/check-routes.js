import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all pages that exist
const pagesDir = './src/pages';
if (!fs.existsSync(pagesDir)) {
  console.log('❌ Pages directory not found!');
  process.exit(1);
}

const existingPages = fs.readdirSync(pagesDir)
  .filter(f => f.endsWith('.tsx'))
  .map(f => f.replace('.tsx', ''));

console.log('\x1b[36m%s\x1b[0m', '📋 ROUTES VERIFICATION:');
console.log('=======================\n');

console.log('\x1b[33m%s\x1b[0m', '📄 EXISTING PAGES:');
existingPages.forEach(p => console.log(`   ✅ ${p}`));

// Check routes.ts for all paths
const routesFile = './src/routes.ts';
if (!fs.existsSync(routesFile)) {
  console.log('❌ routes.ts not found!');
  process.exit(1);
}

const routesContent = fs.readFileSync(routesFile, 'utf8');
const routeMatches = routesContent.matchAll(/['"]([^'"]+)['"]/g);
const routes = [...routeMatches].map(m => m[1]).filter(r => r.startsWith('/'));

console.log('\n\x1b[33m%s\x1b[0m', '✅ DEFINED ROUTES:');
routes.forEach(r => console.log(`   ${r}`));

console.log('\n\x1b[33m%s\x1b[0m', '🔍 CHECKING ROUTE-PAGE MAPPING:');
routes.forEach(route => {
  const pageName = route.replace('/', '').split('/')[0] || 'Dashboard';
  const pageVariations = [
    pageName,
    pageName.charAt(0).toUpperCase() + pageName.slice(1).toLowerCase(),
    'NotFound',
    'LoadingPage'
  ];
  
  const exists = pageVariations.some(p => 
    existingPages.includes(p) || 
    existingPages.includes(p + '.tsx')
  );
  
  if (exists) {
    console.log(`   ✅ ${route} -> Page exists`);
  } else {
    console.log(`   ❌ ${route} -> NO PAGE FOUND! (looked for: ${pageVariations.join(', ')})`);
  }
});
