import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { exercises, duration } = body;

  try {
    const workout = await prisma.workout.create({
      data: {
        userId: session.user.id,
        name: 'Live Session',
        date: new Date(),
        duration: duration || 0,
        exercises: {
          create: exercises.map((ex: any, idx: number) => ({
            exerciseId: ex.exerciseId,
            order: idx,
            sets: {
              create: ex.sets.map((set: any, sIdx: number) => ({
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
    return NextResponse.json({ error: 'Failed to save workout' }, { status: 500 });
  }
}
