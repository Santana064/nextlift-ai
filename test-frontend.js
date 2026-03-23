// Paste this in browser console (F12) on the nutrition page

async function testFrontend() {
  console.log('🧪 Testing NEXTLIFT AI Frontend\n');
  
  // Test 1: Check if user is logged in
  console.log('1. Checking authentication...');
  const token = localStorage.getItem('token');
  if (token) {
    console.log('   ✅ User is logged in');
  } else {
    console.log('   ❌ Not logged in');
  }
  
  // Test 2: Check nutrition data loading
  console.log('\n2. Checking nutrition page...');
  const meals = document.querySelectorAll('.bg-gray-700\\/30.rounded-xl');
  console.log(`   Found ${meals.length} meals on page`);
  
  // Test 3: Check water intake
  console.log('\n3. Checking water intake...');
  const waterText = document.querySelector('.text-blue-400')?.innerText;
  if (waterText) {
    console.log(`   Water intake: ${waterText}`);
  }
  
  // Test 4: Check if buttons work
  console.log('\n4. Checking buttons...');
  const searchBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Search Food'));
  const addMealBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Add Meal'));
  
  if (searchBtn) console.log('   ✅ Search Food button found');
  if (addMealBtn) console.log('   ✅ Add Meal button found');
  
  // Test 5: Check localStorage structure
  console.log('\n5. Checking localStorage...');
  const storageKeys = Object.keys(localStorage);
  const nutritionKeys = storageKeys.filter(k => k.includes('nutrition'));
  console.log(`   Found ${nutritionKeys.length} nutrition-related keys`);
  
  console.log('\n🎉 Frontend tests complete!');
}

testFrontend();
