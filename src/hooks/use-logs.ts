'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dailyLogSchema } from '@/lib/validations/logs';
import { z } from 'zod';

type DailyLogInput = z.infer<typeof dailyLogSchema>;

export function useLogs(from?: string, to?: string) {
  return useQuery({
    queryKey: ['logs', from, to],
    queryFn: async () => {
      const url = new URL('/api/logs', window.location.origin);
      if (from) url.searchParams.append('from', from);
      if (to) url.searchParams.append('to', to);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      return response.json();
    },
  });
}

export function useUpsertLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DailyLogInput) => {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to upsert log');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });
}
