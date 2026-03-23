const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: 'demo@nextlift.com',
        name: 'Demo User',
        password: 'demo123'
      }
    });
    console.log('? User created:', user.id);

    // Create a test workout
    const workout = await prisma.workout.create({
      data: {
        userId: user.id,
        type: 'squat',
        duration: 180,
        calories: 65,
        formScore: 92,
        notes: 'Great workout!'
      }
    });
    console.log('? Workout created:', workout.id);

    // List all workouts
    const workouts = await prisma.workout.findMany({
      include: { user: true }
    });
    console.log('\n?? All workouts:', JSON.stringify(workouts, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
