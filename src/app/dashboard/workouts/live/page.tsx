'use client';
import { useState } from 'react';
import { useLiveWorkoutStore } from '@/store/use-live-workout-store';
import { LiveWorkoutTimer } from '@/components/dashboard/live-workout/live-workout-timer';
import { LiveWorkoutList } from '@/components/dashboard/live-workout/live-workout-list';
import { ExerciseSearchModal } from '@/components/dashboard/live-workout/exercise-search-modal';
import { useRouter } from 'next/navigation';

export default function LiveWorkoutPage() {
  const { isActive, exercises, workoutStartTime, finishWorkout, cancelWorkout } = useLiveWorkoutStore();
  const [isCanceling, setIsCanceling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
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
    try {
      setIsSubmitting(true);
      const duration = workoutStartTime ? Math.floor((Date.now() - workoutStartTime) / 60000) : 0;
      const res = await fetch('/api/workouts/live', {
        method: 'POST',
        body: JSON.stringify({ exercises, duration })
      });
      
      if (!res.ok) {
        throw new Error('Failed to save workout');
      }
      
      finishWorkout();
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Failed to save workout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            <button onClick={handleDiscard} disabled={isSubmitting} className="text-error font-label-caps text-[11px] uppercase tracking-widest flex-1 border border-error py-2 disabled:opacity-50">Discard</button>
            <button onClick={handleFinish} disabled={isSubmitting} className="editorial-button font-label-caps text-[11px] uppercase tracking-widest flex-1 py-2 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save Incomplete'}
            </button>
            <button onClick={() => setIsCanceling(false)} disabled={isSubmitting} className="text-on-surface-variant disabled:opacity-50"><span className="material-symbols-outlined">close</span></button>
          </div>
        ) : (
          <>
            <button onClick={() => setIsCanceling(true)} disabled={isSubmitting} className="text-on-surface-variant disabled:opacity-50"><span className="material-symbols-outlined">close</span></button>
            <h1 className="font-outfit text-2xl">Live Session</h1>
            <button onClick={handleFinish} disabled={isSubmitting} className="editorial-button px-4 py-2 font-label-caps text-[11px] uppercase tracking-widest disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Finish'}
            </button>
          </>
        )}
      </header>
      <main className="p-6 max-w-2xl mx-auto">
        <LiveWorkoutList />
        <button onClick={() => setShowAdd(true)} className="w-full py-4 mt-6 border border-dashed border-outline-variant text-on-surface-variant font-label-caps tracking-widest text-[11px] uppercase hover:text-secondary transition-colors">
          + Add Exercise
        </button>
        {showAdd && <ExerciseSearchModal onClose={() => setShowAdd(false)} />}
      </main>
    </div>
  );
}
