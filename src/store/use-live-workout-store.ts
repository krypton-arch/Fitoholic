'use client';

import { create } from 'zustand';

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

// Manual localStorage persistence (replaces zustand/middleware persist)
const STORAGE_KEY = 'live-workout-storage';

function loadFromStorage(): Partial<LiveWorkoutState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.state || {};
    }
  } catch { /* ignore */ }
  return {};
}

function saveToStorage(state: LiveWorkoutState) {
  if (typeof window === 'undefined') return;
  try {
    const data = {
      state: {
        isActive: state.isActive,
        workoutPlanId: state.workoutPlanId,
        workoutStartTime: state.workoutStartTime,
        exercises: state.exercises,
        activeTimerStart: state.activeTimerStart,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

const persisted = loadFromStorage();

export const useLiveWorkoutStore = create<LiveWorkoutState>()((set, get) => ({
  isActive: persisted.isActive ?? false,
  workoutPlanId: persisted.workoutPlanId,
  workoutStartTime: persisted.workoutStartTime ?? null,
  exercises: persisted.exercises ?? [],
  activeTimerStart: persisted.activeTimerStart ?? null,
  startWorkout: (planId, initial = []) => {
    set({ isActive: true, workoutPlanId: planId, exercises: initial, activeTimerStart: null, workoutStartTime: Date.now() });
    saveToStorage(get());
  },
  toggleSetComplete: (eId, sId) => {
    set((state) => {
      const exs = state.exercises.map(e => {
        if (e.id !== eId) return e;
        return {
          ...e,
          sets: e.sets.map(s => s.id === sId ? { ...s, completed: !s.completed } : s)
        };
      });
      const newlyCompleted = exs.find(e => e.id === eId)?.sets.find(s => s.id === sId)?.completed;
      return { exercises: exs, activeTimerStart: newlyCompleted ? Date.now() : state.activeTimerStart };
    });
    saveToStorage(get());
  },
  updateSet: (eId, sId, updates) => {
    set((state) => ({
      exercises: state.exercises.map(e => e.id === eId ? {
        ...e, sets: e.sets.map(s => s.id === sId ? { ...s, ...updates } : s)
      } : e)
    }));
    saveToStorage(get());
  },
  addExercise: (ex) => {
    set((state) => ({ exercises: [...state.exercises, ex] }));
    saveToStorage(get());
  },
  removeExercise: (eId) => {
    set((state) => ({ exercises: state.exercises.filter(e => e.id !== eId) }));
    saveToStorage(get());
  },
  finishWorkout: () => {
    set({ isActive: false, exercises: [], activeTimerStart: null, workoutPlanId: undefined, workoutStartTime: null });
    saveToStorage(get());
  },
  cancelWorkout: () => {
    set({ isActive: false, exercises: [], activeTimerStart: null, workoutPlanId: undefined, workoutStartTime: null });
    saveToStorage(get());
  },
}));
