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
    const logs = [];
    for (const ex of exercises) {
      for (const set of ex.sets) {
        if (set.completed) {
          logs.push({
            userId: session.user.id,
            exerciseId: ex.exerciseId,
            sets: 1,
            reps: set.reps,
            weightKg: set.weight,
            performedAt: new Date(),
          });
        }
      }
    }
    
    if (logs.length > 0) {
      await prisma.workoutLog.createMany({ data: logs });
    }
    
    return NextResponse.json({ success: true, loggedSets: logs.length });
  } catch (e) {
    console.error('[WORKOUT_LIVE_POST]', e);
    return NextResponse.json({ error: 'Failed to save workout' }, { status: 500 });
  }
}
