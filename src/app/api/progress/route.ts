import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { subDays, startOfDay } from 'date-fns';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;
    const sevenDaysAgo = startOfDay(subDays(new Date(), 6));

    const dailyLogs = await prisma.dailyLog.findMany({
      where: { userId, date: { gte: sevenDaysAgo } },
      orderBy: { date: 'asc' }
    });

    const meals = await prisma.mealEntry.findMany({
      where: { userId, loggedAt: { gte: sevenDaysAgo } },
      include: { food: true }
    });

    const workouts = await prisma.workoutLog.findMany({
      where: { userId, performedAt: { gte: sevenDaysAgo } }
    });

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dateString = date.toLocaleDateString('en-US', { weekday: 'short' }); 
      
      const dayMeals = meals.filter(m => startOfDay(m.loggedAt).getTime() === date.getTime());
      const calories = dayMeals.reduce((acc, m) => acc + (m.food.caloriesPer100g * m.quantityG) / 100, 0);
      
      const dayWorkouts = workouts.filter(w => startOfDay(w.performedAt).getTime() === date.getTime());
      const workoutCount = dayWorkouts.length;
      
      const log = dailyLogs.find(l => startOfDay(l.date).getTime() === date.getTime());
      
      days.push({
        name: dateString,
        calories: Math.round(calories),
        weight: log?.weightKg || null,
        workouts: workoutCount
      });
    }

    return NextResponse.json(days);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
