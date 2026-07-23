const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const meals = await prisma.mealEntry.findMany();
  console.log('Meals:', meals);
  
  const workouts = await prisma.workoutLog.findMany();
  console.log('Workouts:', workouts);
}

main().catch(console.error).finally(() => prisma.$disconnect());
