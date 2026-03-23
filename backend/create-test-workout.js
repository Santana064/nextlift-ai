const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestWorkout() {
  try {
    // Find or create demo user
    let user = await prisma.user.findFirst();
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'demo@nextlift.com',
          name: 'Demo User',
          password: '$2a$10$demopasswordhash'
        }
      });
      console.log('✅ Demo user created');
    }

    // Create a test workout with all fields
    const workout = await prisma.workout.create({
      data: {
        userId: user.id,
        type: 'squat',
        exerciseName: 'Barbell Squats',
        reps: 12,
        sets: 3,
        duration: 180,
        calories: 65,
        formScore: 92,
        notes: 'Great workout! Felt strong.',
        completedAt: new Date(),
        createdAt: new Date()
      }
    });

    console.log('✅ Test workout created successfully!');
    console.log('ID:', workout.id);
    console.log('Exercise:', workout.exerciseName);
    console.log('Reps:', workout.reps);
    console.log('Sets:', workout.sets);
    console.log('Form Score:', workout.formScore);
    
  } catch (error) {
    console.error('❌ Error creating workout:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestWorkout();
