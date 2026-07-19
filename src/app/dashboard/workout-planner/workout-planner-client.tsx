"use client";

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast-provider';
import { useLiveWorkoutStore, LiveExercise, LiveSet } from '@/store/use-live-workout-store';
import { useRouter } from 'next/navigation';

export function WorkoutPlannerClient() {
  const { toast } = useToast();
  const router = useRouter();
  const startWorkout = useLiveWorkoutStore(s => s.startWorkout);
  const [goals, setGoals] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch saved plan on mount
    fetch('/api/planner/saved')
      .then(res => res.json())
      .then(data => {
        if (data.aiWorkoutPlan) {
          setPlan(data.aiWorkoutPlan);
          setIsSaved(true);
        }
      })
      .catch(err => console.error("Failed to load saved plan", err));
  }, []);

  const generatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goals.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'WORKOUT', goals })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate plan');
      }
      
      setPlan(data.plan);
      setIsSaved(false); // New plan, not saved yet
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const savePlan = async () => {
    if (!plan) return;
    setSaving(true);
    try {
      const res = await fetch('/api/planner/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'WORKOUT', plan })
      });
      if (!res.ok) throw new Error('Failed to save plan');
      setIsSaved(true);
      toast('Protocol archived successfully.', 'success');
    } catch (err: any) {
      setError(err.message);
      toast('Failed to archive protocol.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remakePlan = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/planner/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'WORKOUT', plan: null })
      });
      if (!res.ok) throw new Error('Failed to clear plan');
      setPlan(null);
      setIsSaved(false);
      setGoals(''); // Clear goals for a fresh start
      toast('Protocol refined.', 'info');
    } catch (err: any) {
      setError(err.message);
      toast('Failed to clear protocol.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const launchLiveWorkout = (exercises: any[]) => {
    // Map AI exercises to LiveWorkoutStore format
    const liveExercises: LiveExercise[] = exercises.map(ex => {
      // Try to parse reps, e.g. "8-12" -> 10, "10" -> 10, "to failure" -> 0
      let parsedReps = 0;
      if (typeof ex.reps === 'string') {
        const match = ex.reps.match(/(\d+)/g);
        if (match && match.length === 2) {
          parsedReps = Math.floor((parseInt(match[0]) + parseInt(match[1])) / 2);
        } else if (match && match.length === 1) {
          parsedReps = parseInt(match[0]);
        }
      } else if (typeof ex.reps === 'number') {
        parsedReps = ex.reps;
      }

      const sets: LiveSet[] = Array.from({ length: parseInt(ex.sets) || 3 }).map(() => ({
        id: crypto.randomUUID(),
        weight: 0,
        reps: parsedReps,
        completed: false
      }));

      return {
        id: crypto.randomUUID(),
        exerciseId: ex.exerciseId || 'unknown', // Will be populated by the AI thanks to prompt injection
        name: ex.name || 'Unknown Exercise',
        sets
      };
    });

    startWorkout(undefined, liveExercises);
    router.push('/dashboard/workouts/live');
  };

  return (
    <section className="space-y-12 max-w-4xl mx-auto">
      
      {!plan && (
        <div className="animate-fade-up delay-100 border-t border-b border-outline-variant py-12">
          <div className="text-center mb-8">
            <h2 className="font-display-lg text-[32px] text-on-surface mb-2">Training Protocol</h2>
            <p className="font-body-md text-on-surface-variant italic">Define your regimen</p>
          </div>
          <form onSubmit={generatePlan} className="space-y-8">
            <div className="space-y-4">
              <label htmlFor="goals" className="block font-label-caps text-[12px] uppercase tracking-widest text-on-surface text-center">
                What are your training goals?
              </label>
              <textarea
                id="goals"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="e.g. I want to build muscle and increase strength. I work out 5 days a week and focus on powerlifting."
                className="editorial-input w-full min-h-[160px] p-6 bg-transparent border border-outline-variant focus:border-on-surface outline-none transition-all resize-none font-body-md text-on-surface placeholder:text-on-surface/30 text-center leading-relaxed"
                required
              />
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading || !goals.trim()}
                className="editorial-button px-10 py-4 font-label-caps text-[12px] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 w-full sm:w-auto active:scale-[0.99] transition-transform"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                    Curating Protocol...
                  </>
                ) : (
                  <>
                    Generate Regimen
                  </>
                )}
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2 text-center font-body-md">{error}</p>
            )}
          </form>
        </div>
      )}

      {loading && (
        <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 animate-pulse border-y border-outline-variant">
          <h3 className="font-display-lg text-[28px] text-on-surface">Structuring your regimen</h3>
          <p className="font-body-md text-on-surface-variant max-w-md italic">
            Curating a personalized 7-day training protocol based on your specifications.
          </p>
        </div>
      )}

      {plan && !loading && (
        <div className="space-y-12 animate-fade-up">
          
          {/* Action Bar */}
          <div className="py-8 border-b border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="font-display-lg text-[24px] text-on-surface">Your Protocol</h3>
              <p className="font-body-md text-on-surface-variant italic">Seven-Day Regimen</p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button
                onClick={remakePlan}
                disabled={saving}
                className="flex-1 sm:flex-none px-6 py-3 border border-outline-variant text-on-surface font-label-caps text-[11px] uppercase tracking-widest hover:border-secondary hover:text-secondary transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                Refine
              </button>
              <button
                onClick={savePlan}
                disabled={saving || isSaved}
                className={`flex-1 sm:flex-none px-6 py-3 font-label-caps text-[11px] uppercase tracking-widest border transition-all flex items-center justify-center gap-2 active:scale-[0.99] ${
                  isSaved 
                  ? 'border-primary/30 text-primary cursor-default'
                  : 'editorial-button border-none'
                }`}
              >
                {saving ? (
                  <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                ) : isSaved ? (
                  <span className="material-symbols-outlined text-[14px]">check</span>
                ) : (
                  <span className="material-symbols-outlined text-[14px]">bookmark</span>
                )}
                {isSaved ? 'Archived' : 'Archive Protocol'}
              </button>
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="space-y-16">
            {plan.map((dayPlan: any, i: number) => {
              const isRest = !dayPlan.exercises || dayPlan.exercises.length === 0;

              return (
                <div key={i} className={`flex flex-col lg:flex-row gap-8 lg:gap-16 group ${isRest ? 'opacity-60' : ''}`}>
                  
                  <div className="lg:w-1/3 flex flex-col pt-2">
                    <div className="flex items-baseline gap-4 mb-2">
                      <h3 className="font-display-lg text-[32px] text-on-surface">Day {dayPlan.day}</h3>
                      {!isRest && (
                        <span className="text-primary font-label-caps text-[10px] uppercase tracking-widest">Active</span>
                      )}
                    </div>
                    <p className="font-body-md text-on-surface-variant text-[15px] italic leading-relaxed">{dayPlan.focus}</p>
                    
                    {!isRest && (
                      <div className="mt-8 pt-6 border-t border-outline-variant/50">
                        <span className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">Movement Count</span>
                        <div className="font-headline-md text-[24px] text-on-surface mt-1">{dayPlan.exercises.length}</div>
                      </div>
                    )}
                  </div>

                  <div className="lg:w-2/3 flex flex-col gap-6">
                    {!isRest ? (
                      dayPlan.exercises.map((exercise: any, index: number) => {
                        return (
                          <div key={index} className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-outline-variant/30 pb-6">
                            <div className="flex flex-col gap-2 flex-1 pr-4">
                              <div className="flex items-center gap-3">
                                <span className="font-label-caps text-[10px] uppercase tracking-widest text-secondary/70">
                                  {String(index + 1).padStart(2, '0')}
                                </span>
                                <h4 className="font-headline-md text-[20px] text-on-surface">{exercise.name}</h4>
                              </div>
                              {exercise.notes && (
                                <p className="font-body-md text-[14px] text-on-surface-variant italic pl-8">{exercise.notes}</p>
                              )}
                            </div>
                            <div className="flex gap-6 font-label-caps text-[11px] tracking-widest text-secondary pt-2 sm:pt-0">
                              <span className="flex flex-col items-center"><span className="text-on-surface text-[14px] font-headline-md mb-1">{exercise.sets}</span> Sets</span>
                              <span className="flex flex-col items-center"><span className="text-on-surface text-[14px] font-headline-md mb-1">{exercise.reps}</span> Reps</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex items-center justify-center h-full py-12 text-on-surface-variant font-body-md italic border border-outline-variant/30 rounded-none">
                        Rest Day — Active recovery and reflection.
                      </div>
                    )}
                    
                    {!isRest && (
                      <div className="mt-4 flex justify-end">
                        <button 
                          onClick={() => launchLiveWorkout(dayPlan.exercises)}
                          className="editorial-button px-6 py-3 font-label-caps text-[11px] uppercase tracking-widest flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                          Launch Live Session
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
