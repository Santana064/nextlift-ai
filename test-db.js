const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDatabase() {
  console.log('🧪 Testing Database\n');
  
  // Test 1: Check users
  console.log('1. Checking users...');
  const users = await prisma.user.findMany();
  console.log(`   ✅ Found ${users.length} users`);
  
  // Test 2: Check workouts
  console.log('\n2. Checking workouts...');
  const workouts = await prisma.workout.findMany();
  console.log(`   ✅ Found ${workouts.length} workouts`);
  
  if (workouts.length > 0) {
    const recent = workouts[0];
    console.log(`   Latest: ${recent.exerciseName || recent.type} - ${recent.reps || 0} reps`);
  }
  
  // Test 3: Check meals
  console.log('\n3. Checking meals...');
  const meals = await prisma.meal.findMany();
  console.log(`   ✅ Found ${meals.length} meals`);
  
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
  
  console.log('\n🎉 Database tests passed!');
  await prisma.$disconnect();
}

testDatabase().catch(console.error);
