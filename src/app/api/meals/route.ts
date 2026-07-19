import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    let startOfToday, endOfToday;
    if (startParam && endParam) {
      startOfToday = new Date(startParam);
      endOfToday = new Date(endParam);
    } else {
      startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
    }

    const meals = await prisma.mealEntry.findMany({
      where: {
        userId: session.user.id,
        loggedAt: {
          gte: startOfToday,
          lte: endOfToday
        }
      },
      include: {
        food: true
      },
      orderBy: {
        loggedAt: 'desc'
      }
    });

    return NextResponse.json(meals);
  } catch (error) {
    console.error('Failed to fetch meals:', error);
    return NextResponse.json({ error: 'Failed to fetch meals' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { foodId, mealType, quantityG, portionLabel } = data;

    if (!foodId || !mealType || !quantityG) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const meal = await prisma.mealEntry.create({
      data: {
        userId: session.user.id,
        foodId,
        mealType,
        quantityG,
        portionLabel
      },
      include: {
        food: true
      }
    });

    return NextResponse.json(meal);
  } catch (error) {
    console.error('Failed to log meal:', error);
    return NextResponse.json({ error: 'Failed to log meal' }, { status: 500 });
  }
}
