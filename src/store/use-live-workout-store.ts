'use client';

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

export interface LiveWorkoutState {
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
