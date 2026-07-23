'use client';

import { useLiveWorkoutStore } from '@/store/use-live-workout-store';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

// Basic interfaces based on usage
interface WorkoutSet {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
}

interface Exercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
}

function SetRow({ exerciseId, set, index }: { exerciseId: string; set: WorkoutSet; index: number }) {
  const { updateSet, toggleSetComplete } = useLiveWorkoutStore();
  const [weight, setWeight] = useState(set.weight.toString());
  const [reps, setReps] = useState(set.reps.toString());

  // Keep local state in sync if external updates happen
  useEffect(() => {
    setWeight(set.weight.toString());
    setReps(set.reps.toString());
  }, [set.weight, set.reps]);

  const handleBlur = (field: 'weight' | 'reps', val: string) => {
    let num = Number(val);
    if (isNaN(num) || num < 0) num = 0;
    updateSet(exerciseId, set.id, { [field]: num });
    if (field === 'weight') setWeight(num.toString());
    else setReps(num.toString());
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-outline-variant/50 last:border-0">
      <span className="font-label-caps text-[11px] text-on-surface-variant">Set {index + 1}</span>
      <div className="flex gap-2 items-center">
        <input 
          type="number" 
          min="0"
          value={weight} 
          onChange={(e) => setWeight(e.target.value)}
          onBlur={(e) => handleBlur('weight', e.target.value)}
          aria-label="Weight in kg"
          className="w-16 bg-transparent border-b border-outline-variant text-center font-body-md text-on-surface focus:outline-none" 
        />
        <span className="text-on-surface-variant text-sm">kg</span>
        <span className="mx-2 text-sm">×</span>
        <input 
          type="number" 
          min="0"
          value={reps} 
          onChange={(e) => setReps(e.target.value)}
          onBlur={(e) => handleBlur('reps', e.target.value)}
          aria-label="Reps"
          className="w-12 bg-transparent border-b border-outline-variant text-center font-body-md text-on-surface focus:outline-none" 
        />
      </div>
      <button 
        onClick={() => toggleSetComplete(exerciseId, set.id)} 
        className="active:scale-95 transition-transform"
        aria-label={set.completed ? "Mark set incomplete" : "Mark set complete"}
      >
        <span className={`material-symbols-outlined text-[24px] ${set.completed ? 'text-secondary' : 'text-outline'}`}>
          {set.completed ? 'check_circle' : 'radio_button_unchecked'}
        </span>
      </button>
    </div>
  );
}

function ExerciseCard({ ex, idx }: { ex: Exercise; idx: number }) {
  const { removeExercise } = useLiveWorkoutStore();

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="relative overflow-hidden mb-6 last:mb-0 rounded-xl"
    >
      {/* Background delete layer */}
      <div className="absolute inset-0 bg-error flex items-center justify-end px-6 text-on-error rounded-xl">
        <span className="material-symbols-outlined" aria-hidden="true">delete</span>
      </div>
      
      {/* Draggable foreground layer */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(e, { offset, velocity }) => {
          if (offset.x < -80 || velocity.x < -400) removeExercise(ex.id);
        }}
        className="editorial-card p-6 bg-surface-container relative z-10 rounded-xl h-full"
      >
        <h3 className="font-outfit text-xl mb-4">{idx + 1}. {ex.name}</h3>
        <div className="flex flex-col gap-2">
          {ex.sets.map((set, sIdx) => (
            <SetRow key={set.id} exerciseId={ex.id} set={set} index={sIdx} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function LiveWorkoutList() {
  const { exercises } = useLiveWorkoutStore();
  
  return (
    <div className="flex flex-col">
      <AnimatePresence>
        {exercises.map((ex, idx) => (
          <ExerciseCard key={ex.id} ex={ex as Exercise} idx={idx} />
        ))}
      </AnimatePresence>
    </div>
  );
}
