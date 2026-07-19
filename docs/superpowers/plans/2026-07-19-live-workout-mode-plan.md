# Live Workout Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-optimized, in-gym live workout companion with a hybrid count-up timer and offline-tolerant local state.

**Architecture:** A client-side Zustand store (with `localStorage` persistence) holds the live session state. The UI renders the active workout as a "Full List" layout. On completion, the payload is POSTed to the server.

**Tech Stack:** Next.js App Router, React, Zustand, Prisma, Tailwind CSS v4, Framer Motion (for swipe-to-delete).

---

### Task 1: Client-Side State Management (Zustand)

**Files:**
- Create: `src/store/use-live-workout-store.ts`

- [ ] **Step 1: Write Zustand store with persist middleware**

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LiveSet {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface LiveExercise {
  id: string;
  exerciseId: string;
  name: string;
  sets: LiveSet[];
}

interface LiveWorkoutState {
  isActive: boolean;
  workoutPlanId?: string;
  workoutStartTime: number | null;
  exercises: LiveExercise[];
  activeTimerStart: number | null;
  startWorkout: (planId?: string, initialExercises?: LiveExercise[]) => void;
  toggleSetComplete: (exerciseId: string, setId: string) => void;
  updateSet: (exerciseId: string, setId: string, updates: Partial<LiveSet>) => void;
  addExercise: (exercise: LiveExercise) => void;
  removeExercise: (exerciseId: string) => void;
  finishWorkout: () => void;
  cancelWorkout: () => void;
}

export const useLiveWorkoutStore = create<LiveWorkoutState>()(
  persist(
    (set, get) => ({
      isActive: false,
      exercises: [],
      workoutStartTime: null,
      activeTimerStart: null,
      startWorkout: (planId, initial = []) => set({ isActive: true, workoutPlanId: planId, exercises: initial, activeTimerStart: null, workoutStartTime: Date.now() }),
      toggleSetComplete: (eId, sId) => set((state) => {
        const exs = state.exercises.map(e => {
          if (e.id !== eId) return e;
          return {
            ...e,
            sets: e.sets.map(s => s.id === sId ? { ...s, completed: !s.completed } : s)
          };
        });
        const newlyCompleted = exs.find(e => e.id === eId)?.sets.find(s => s.id === sId)?.completed;
        return { exercises: exs, activeTimerStart: newlyCompleted ? Date.now() : state.activeTimerStart };
      }),
      updateSet: (eId, sId, updates) => set((state) => ({
        exercises: state.exercises.map(e => e.id === eId ? {
          ...e, sets: e.sets.map(s => s.id === sId ? { ...s, ...updates } : s)
        } : e)
      })),
      addExercise: (ex) => set((state) => ({ exercises: [...state.exercises, ex] })),
      removeExercise: (eId) => set((state) => ({ exercises: state.exercises.filter(e => e.id !== eId) })),
      finishWorkout: () => set({ isActive: false, exercises: [], activeTimerStart: null, workoutPlanId: undefined, workoutStartTime: null }),
      cancelWorkout: () => set({ isActive: false, exercises: [], activeTimerStart: null, workoutPlanId: undefined, workoutStartTime: null }),
    }),
    { name: 'live-workout-storage' }
  )
);
```

- [ ] **Step 2: Commit**

```bash
git add src/store/use-live-workout-store.ts
git commit -m "feat: add zustand live workout store with persistence"
```

### Task 2: Live Workout UI Shell & Cancel Flow

**Files:**
- Create: `src/app/dashboard/workouts/live/page.tsx`
- Create: `src/components/dashboard/live-workout/live-workout-timer.tsx`

- [ ] **Step 1: Write Timer Component**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { useLiveWorkoutStore } from '@/store/use-live-workout-store';

export function LiveWorkoutTimer() {
  const activeTimerStart = useLiveWorkoutStore(s => s.activeTimerStart);
  const [elapsed, setElapsed] = useState(0);

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
```

- [ ] **Step 2: Write Main Layout (Shell)**

```tsx
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
        <LiveWorkoutList />
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/workouts/live/page.tsx src/components/dashboard/live-workout/live-workout-timer.tsx
git commit -m "feat: add live workout shell, timer, and abandonment flow"
```

### Task 3: Live Workout List & Swipe-to-Delete

**Files:**
- Create: `src/components/dashboard/live-workout/live-workout-list.tsx`

- [ ] **Step 1: Write LiveWorkoutList Component**

```tsx
'use client';
import { useLiveWorkoutStore } from '@/store/use-live-workout-store';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function LiveWorkoutList() {
  const { exercises, toggleSetComplete, removeExercise, updateSet } = useLiveWorkoutStore();
  
  return (
    <div className="flex flex-col gap-6">
      <AnimatePresence>
        {exercises.map((ex, idx) => (
          <motion.div 
            key={ex.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            drag="x"
            dragConstraints={{ left: -100, right: 0 }}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.x < -50 || velocity.x < -500) removeExercise(ex.id);
            }}
            className="editorial-card p-6 bg-surface-container"
          >
            <h3 className="font-outfit text-xl mb-4">{idx + 1}. {ex.name}</h3>
            <div className="flex flex-col gap-2">
              {ex.sets.map((set, sIdx) => (
                <div key={set.id} className="flex items-center justify-between py-2 border-b border-outline-variant/50 last:border-0">
                  <span className="font-label-caps text-[11px] text-on-surface-variant">Set {sIdx + 1}</span>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={set.weight} 
                      onChange={(e) => updateSet(ex.id, set.id, { weight: Number(e.target.value) })}
                      className="w-16 bg-transparent border-b border-outline-variant text-center font-body-md text-on-surface focus:outline-none" 
                    />
                    <span className="text-on-surface-variant">kg</span>
                    <span className="mx-2">×</span>
                    <input 
                      type="number" 
                      value={set.reps} 
                      onChange={(e) => updateSet(ex.id, set.id, { reps: Number(e.target.value) })}
                      className="w-12 bg-transparent border-b border-outline-variant text-center font-body-md text-on-surface focus:outline-none" 
                    />
                  </div>
                  <button onClick={() => toggleSetComplete(ex.id, set.id)} className="active:scale-95 transition-transform">
                    <span className={`material-symbols-outlined text-[24px] ${set.completed ? 'text-secondary' : 'text-outline'}`}>
                      {set.completed ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </button>
                </div>
              ))}
            </div>
            <div className="absolute top-0 right-[-100px] h-full flex items-center w-20 bg-error justify-center text-on-error opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <span className="material-symbols-outlined">delete</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/live-workout/live-workout-list.tsx
git commit -m "feat: add live workout list with swipe-to-delete"
```

### Task 4: Add Exercise Modal & API

**Files:**
- Create: `src/components/dashboard/live-workout/exercise-search-modal.tsx`
- Modify: `src/app/dashboard/workouts/live/page.tsx`

- [ ] **Step 1: Write Search Modal Component**

```tsx
'use client';
import { useState } from 'react';
import { useLiveWorkoutStore } from '@/store/use-live-workout-store';
import { motion } from 'framer-motion';

export function ExerciseSearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const { addExercise } = useLiveWorkoutStore();

  // Mock static search for now, assumes we have an API or list of standard exercises
  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length < 2) return setResults([]);
    // Fetch from a public API endpoint or use a local mock array for this task
    const mockDb = [
      { id: 'ex-1', name: 'Barbell Squat' },
      { id: 'ex-2', name: 'Bench Press' },
      { id: 'ex-3', name: 'Deadlift' }
    ];
    setResults(mockDb.filter(e => e.name.toLowerCase().includes(val.toLowerCase())));
  };

  const handleSelect = (ex: any) => {
    addExercise({
      id: crypto.randomUUID(),
      exerciseId: ex.id,
      name: ex.name,
      sets: [{ id: crypto.randomUUID(), weight: 0, reps: 0, completed: false }]
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur z-50 flex flex-col pt-20 px-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-outfit text-xl">Add Exercise</h2>
        <button onClick={onClose}><span className="material-symbols-outlined">close</span></button>
      </div>
      <input 
        type="text" 
        value={query} 
        onChange={e => handleSearch(e.target.value)} 
        placeholder="Search exercises..." 
        className="editorial-input py-4 text-[16px] mb-4"
        autoFocus
      />
      <div className="flex flex-col gap-2 overflow-y-auto pb-32">
        {results.map(r => (
          <button key={r.id} onClick={() => handleSelect(r)} className="text-left p-4 bg-surface-container rounded-sm border border-outline-variant hover:border-secondary transition-colors">
            {r.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add to Page Layout**

Modify `src/app/dashboard/workouts/live/page.tsx`:
Add state `const [showAdd, setShowAdd] = useState(false);`
Render the modal at the bottom of the main content:
```tsx
        <LiveWorkoutList />
        <button onClick={() => setShowAdd(true)} className="w-full py-4 mt-6 border border-dashed border-outline-variant text-on-surface-variant font-label-caps tracking-widest text-[11px] uppercase hover:text-secondary transition-colors">
          + Add Exercise
        </button>
        {showAdd && <ExerciseSearchModal onClose={() => setShowAdd(false)} />}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/live-workout/exercise-search-modal.tsx src/app/dashboard/workouts/live/page.tsx
git commit -m "feat: add exercise search modal to live workout"
```

### Task 5: API Endpoint for Completion

**Files:**
- Create: `src/app/api/workouts/live/route.ts`

- [ ] **Step 1: Write API Route**

```ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { exercises, duration } = body;

  try {
    const workout = await prisma.workout.create({
      data: {
        userId: session.user.id,
        name: 'Live Session',
        date: new Date(),
        duration: duration || 0,
        exercises: {
          create: exercises.map((ex: any, idx: number) => ({
            exerciseId: ex.exerciseId,
            order: idx,
            sets: {
              create: ex.sets.map((set: any, sIdx: number) => ({
                setNumber: sIdx + 1,
                reps: set.reps,
                weightKg: set.weight,
                completed: set.completed
              }))
            }
          }))
        }
      }
    });
    return NextResponse.json(workout);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save workout' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/workouts/live/route.ts
git commit -m "feat: persist live workout data with accurate duration"
```
