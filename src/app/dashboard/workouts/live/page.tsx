'use client';
import { useState } from 'react';
import { useLiveWorkoutStore } from '@/store/use-live-workout-store';
import { LiveWorkoutTimer } from '@/components/dashboard/live-workout/live-workout-timer';
import { LiveWorkoutList } from '@/components/dashboard/live-workout/live-workout-list';
import { useRouter } from 'next/navigation';

export default function LiveWorkoutPage() {
  const { isActive, exercises, workoutStartTime, finishWorkout, cancelWorkout } = useLiveWorkoutStore();
  const [isCanceling, setIsCanceling] = useState(false);
  const router = useRouter();

  if (!isActive) {
    return (
      <div className="p-6 text-center">
        <h2>No Active Workout</h2>
        <button onClick={() => router.push('/dashboard')} className="editorial-button mt-4 px-6 py-2">Back to Dashboard</button>
      </div>
    );
  }

  const handleFinish = async () => {
    const duration = workoutStartTime ? Math.floor((Date.now() - workoutStartTime) / 60000) : 0;
    await fetch('/api/workouts/live', {
      method: 'POST',
      body: JSON.stringify({ exercises, duration })
    });
    finishWorkout();
    router.push('/dashboard');
  };

  const handleDiscard = () => {
    cancelWorkout();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <LiveWorkoutTimer />
      <header className="px-6 py-8 border-b border-outline-variant flex justify-between items-center sticky top-0 bg-background/90 backdrop-blur z-40">
        {isCanceling ? (
          <div className="w-full flex gap-4">
            <button onClick={handleDiscard} className="text-error font-label-caps text-[11px] uppercase tracking-widest flex-1 border border-error py-2">Discard</button>
            <button onClick={handleFinish} className="editorial-button font-label-caps text-[11px] uppercase tracking-widest flex-1 py-2">Save Incomplete</button>
            <button onClick={() => setIsCanceling(false)} className="text-on-surface-variant"><span className="material-symbols-outlined">close</span></button>
          </div>
        ) : (
          <>
            <button onClick={() => setIsCanceling(true)} className="text-on-surface-variant"><span className="material-symbols-outlined">close</span></button>
            <h1 className="font-outfit text-2xl">Live Session</h1>
            <button onClick={handleFinish} className="editorial-button px-4 py-2 font-label-caps text-[11px] uppercase tracking-widest">Finish</button>
          </>
        )}
      </header>
      <main className="p-6 max-w-2xl mx-auto">
        {/* We will implement LiveWorkoutList in the next task, so just mock it for now if needed, or import it and create an empty shell file for it so TypeScript doesn't complain. Actually, create an empty shell file at src/components/dashboard/live-workout/live-workout-list.tsx exporting a dummy function so the import resolves, e.g. export function LiveWorkoutList() { return null; } */}
        <LiveWorkoutList />
      </main>
    </div>
  );
}
