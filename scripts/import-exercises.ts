import { prisma } from '../src/lib/prisma';

async function main() {
  const count = await prisma.exercise.count();
  if (count > 0 && !process.argv.includes('--force')) {
    console.log(`Database already has ${count} exercises. Use --force to clear and re-import.`);
    return;
  }

  if (process.argv.includes('--force')) {
    console.log('Clearing existing exercises...');
    await prisma.exercise.deleteMany({});
  }

  console.log('Fetching exercise dataset...');
  const res = await fetch('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json');
  if (!res.ok) {
    throw new Error(`Failed to fetch dataset: ${res.statusText}`);
  }
  const exercises = await res.json() as any[];

  console.log(`Fetched ${exercises.length} exercises. Formatting...`);
  
  const formatted = exercises.map(ex => {
    let difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' = 'BEGINNER';
    if (ex.level === 'intermediate') difficulty = 'INTERMEDIATE';
    if (ex.level === 'expert') difficulty = 'ADVANCED';

    const muscleGroup = (ex.primaryMuscles && ex.primaryMuscles.length > 0) 
      ? ex.primaryMuscles[0] 
      : 'full_body';

    return {
      name: ex.name,
      muscleGroup: muscleGroup,
      equipment: ex.equipment || 'bodyweight',
      difficulty: difficulty,
      instructions: (ex.instructions || []).join('\n'),
      mediaUrl: null, 
    };
  });

  console.log('Inserting into database...');
  await prisma.exercise.createMany({
    data: formatted,
    skipDuplicates: true, // Though 'name' isn't uniquely constrained, it's safe to include
  });

  console.log('Successfully imported exercises!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
