const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDatabase() {
  console.log('🧪 Testing Database\n');
  
  // Test 1: Check users
  console.log('1. Checking users...');
  const users = await prisma.user.findMany();
  console.log(`   ✅ Found ${users.length} users`);
  users.forEach(u => {
    console.log(`   - ${u.email} (${u.name})`);
  });
  
  // Test 2: Check workouts
  console.log('\n2. Checking workouts...');
  const workouts = await prisma.workout.findMany();
  console.log(`   ✅ Found ${workouts.length} workouts`);
  
  if (workouts.length > 0) {
    console.log('   Latest workouts:');
    workouts.slice(0, 3).forEach(w => {
      console.log(`   - ${w.exerciseName || w.type}: ${w.reps || 0} reps, ${w.duration}s, ${w.formScore || 0}% form`);
    });
  }
  
  // Test 3: Check meals
  console.log('\n3. Checking meals...');
  const meals = await prisma.meal.findMany();
  console.log(`   ✅ Found ${meals.length} meals`);
  
  if (meals.length > 0) {
    console.log('   Recent meals:');
    meals.slice(0, 3).forEach(m => {
      console.log(`   - ${m.name}: ${m.calories} kcal`);
    });
  }
  
  // Test 4: Check water entries
  console.log('\n4. Checking water entries...');
  const water = await prisma.waterEntry.findMany();
  console.log(`   ✅ Found ${water.length} water entries`);
  
  // Test 5: Check streaks
  console.log('\n5. Checking streaks...');
  const streaks = await prisma.streak.findMany();
  console.log(`   ✅ Found ${streaks.length} streaks`);
  streaks.forEach(s => {
    console.log(`   User ${s.userId}: ${s.count} day streak`);
  });
  
  // Summary
  console.log('\n📊 SUMMARY:');
  console.log(`   Users: ${users.length}`);
  console.log(`   Workouts: ${workouts.length}`);
  console.log(`   Meals: ${meals.length}`);
  console.log(`   Water entries: ${water.length}`);
  console.log(`   Active streaks: ${streaks.length}`);
  
  console.log('\n🎉 Database tests passed!');
  await prisma.$disconnect();
}

testDatabase().catch(console.error);
