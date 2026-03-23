import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')
  
  // Create achievements first
  const firstWorkout = await prisma.achievement.upsert({
    where: { id: 'first-workout' },
    update: {},
    create: {
      id: 'first-workout',
      name: 'First Workout',
      description: 'Completed your first workout',
      icon: '🎯',
      points: 100
    }
  })
  
  const strengthBuilder = await prisma.achievement.upsert({
    where: { id: 'strength-builder' },
    update: {},
    create: {
      id: 'strength-builder',
      name: 'Strength Builder',
      description: 'Lifted over 1000kg total',
      icon: '💪',
      points: 500
    }
  })
  
  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10)
  
  const demo = await prisma.user.upsert({
    where: { email: 'demo@nextlift.ai' },
    update: {},
    create: {
      email: 'demo@nextlift.ai',
      password: hashedPassword,
      name: 'Demo User',
      subscription: 'pro',
      points: 1250,
      streak: 7,
      fitnessLevel: 'intermediate',
      workouts: {
        create: [
          {
            type: 'squat',
            duration: 300,
            calories: 120,
            formScore: 85,
            notes: 'Great form today!'
          },
          {
            type: 'bench_press',
            duration: 360,
            calories: 98,
            formScore: 78,
            notes: 'New PR!'
          },
          {
            type: 'deadlift',
            duration: 240,
            calories: 150,
            formScore: 92,
            notes: 'Felt strong'
          }
        ]
      },
      achievements: {
        create: [
          {
            achievementId: firstWorkout.id
          },
          {
            achievementId: strengthBuilder.id
          }
        ]
      }
    }
  })
  
  console.log('✅ Demo user created:', demo.email)
  
  // Create test user
  const testPassword = await bcrypt.hash('test123', 10)
  
  const test = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: testPassword,
      name: 'Test User',
      subscription: 'free',
      points: 500,
      streak: 3,
      fitnessLevel: 'beginner'
    }
  })
  
  console.log('✅ Test user created:', test.email)
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
