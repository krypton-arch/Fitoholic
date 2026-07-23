'use client';
import { useEffect, useState } from 'react';
import { useLiveWorkoutStore } from '@/store/use-live-workout-store';

export function LiveWorkoutTimer() {
  const activeTimerStart = useLiveWorkoutStore(s => s.activeTimerStart);
  const [elapsed, setElapsed] = useState(() => 
    activeTimerStart ? Math.floor((Date.now() - activeTimerStart) / 1000) : 0
  );

  useEffect(() => {
    if (!activeTimerStart) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - activeTimerStart) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTimerStart]);

  if (!activeTimerStart) return null;
  const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const secs = (elapsed % 60).toString().padStart(2, '0');

  return (
    <div className="fixed top-20 right-4 bg-surface-container-high border border-outline-variant rounded-full px-4 py-2 flex items-center gap-2 z-50 shadow-sm animate-fade-in">
      <span className="material-symbols-outlined text-[16px] text-secondary">timer</span>
      <span className="font-outfit font-bold text-on-surface tracking-widest">{mins}:{secs}</span>
    </div>
  );
}
