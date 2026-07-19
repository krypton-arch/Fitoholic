import { prisma } from '@/lib/prisma';
import { dailyLogSchema } from '@/lib/validations/logs';
import { startOfDay } from 'date-fns';
import { z } from 'zod';

export async function getLogsForUser(userId: string) {
  return prisma.dailyLog.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });
}

export async function getLogsByDateRange(userId: string, from: Date, to: Date) {
  return prisma.dailyLog.findMany({
    where: {
      userId,
      date: {
        gte: startOfDay(from),
        lte: startOfDay(to),
      },
    },
    orderBy: { date: 'desc' },
  });
}

export async function upsertDailyLog(userId: string, data: z.infer<typeof dailyLogSchema>) {
  const normalizedDate = startOfDay(new Date(data.date));

  return prisma.dailyLog.upsert({
    where: {
      userId_date: {
        userId,
        date: normalizedDate,
      },
    },
    update: {
      steps: data.steps,
      caloriesBurned: data.caloriesBurned,
      waterMl: data.waterMl,
      weightKg: data.weightKg,
    },
    create: {
      userId,
      date: normalizedDate,
      steps: data.steps,
      caloriesBurned: data.caloriesBurned,
      waterMl: data.waterMl,
      weightKg: data.weightKg,
    },
  });
}
