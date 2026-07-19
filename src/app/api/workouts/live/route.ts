import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const liveWorkoutSchema = z.object({
  duration: z.number().min(0),
  exercises: z.array(z.object({
    exerciseId: z.string(),
    sets: z.array(z.object({
      reps: z.number().min(0),
      weight: z.number().min(0),
      completed: z.boolean()
    }))
  }))
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = liveWorkoutSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
  }

  const { exercises, duration } = parsed.data;

  try {
    const workout = await prisma.workout.create({
      data: {
        userId: session.user.id,
        name: 'Live Session',
        date: new Date(),
        duration: duration || 0,
        exercises: {
          create: exercises.map((ex, idx) => ({
            exerciseId: ex.exerciseId,
            order: idx,
            sets: {
              create: ex.sets.map((set, sIdx) => ({
                setNumber: sIdx + 1,
                reps: set.reps,
                weightKg: set.weight,
                completed: set.completed
              }))
            }
          }))
        }
      }
    });
    return NextResponse.json(workout);
  } catch (e) {
    console.error('[WORKOUT_LIVE_POST]', e);
    return NextResponse.json({ error: 'Failed to save workout' }, { status: 500 });
  }
}
