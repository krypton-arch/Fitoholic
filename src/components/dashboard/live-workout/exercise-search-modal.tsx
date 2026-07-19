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
        className="editorial-input py-4 text-[16px] mb-4 bg-surface-container border border-outline-variant px-4 rounded-md focus:border-secondary focus:outline-none"
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
