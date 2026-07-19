import { z } from 'zod';

export const dailyLogSchema = z.object({
  date: z.string().or(z.date()), // Accepts ISO string or Date
  steps: z.number().int().nonnegative().optional().nullable(),
  caloriesBurned: z.number().int().nonnegative().optional().nullable(),
  waterMl: z.number().int().nonnegative().optional().nullable(),
  weightKg: z.number().nonnegative().optional().nullable(),
});
