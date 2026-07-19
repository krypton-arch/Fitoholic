import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const workouts = await prisma.workoutLog.findMany({
      where: {
        userId: session.user.id,
        performedAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      include: {
        exercise: true,
      },
      orderBy: {
        performedAt: 'desc',
      }
    });

    return NextResponse.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { exerciseId, sets, reps, weightKg } = body;

    if (!exerciseId || typeof sets !== 'number' || typeof reps !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const log = await prisma.workoutLog.create({
      data: {
        userId: session.user.id,
        exerciseId,
        sets,
        reps,
        weightKg: weightKg || null,
      },
      include: {
        exercise: true,
      }
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Error logging workout:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
