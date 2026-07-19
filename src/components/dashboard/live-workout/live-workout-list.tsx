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
            className="editorial-card p-6 bg-surface-container relative overflow-hidden"
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
