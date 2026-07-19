"use client";

import { useState, useEffect, useRef } from "react";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string | null;
}

interface WorkoutLog {
  id: string;
  exercise: Exercise;
  sets: number;
  reps: number;
  weightKg: number | null;
  performedAt: string;
}

export function WorkoutLogger() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [sets, setSets] = useState<number | "">("");
  const [reps, setReps] = useState<number | "">("");
  const [weightKg, setWeightKg] = useState<number | "">("");
  
  const [isLogging, setIsLogging] = useState(false);
  const [recentLogs, setRecentLogs] = useState<WorkoutLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch today's logs on mount
  useEffect(() => {
    fetchLogs();
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/exercises/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (error) {
        console.error("Failed to search exercises:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const fetchLogs = async () => {
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      
      const res = await fetch(`/api/workouts?start=${start.toISOString()}&end=${end.toISOString()}`);
      if (res.ok) {
        const data = await res.json();
        setRecentLogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleLogWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExercise || !sets || !reps) return;
    
    setIsLogging(true);
    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId: selectedExercise.id,
          sets: Number(sets),
          reps: Number(reps),
          weightKg: weightKg ? Number(weightKg) : undefined,
        }),
      });

      if (res.ok) {
        const newLog = await res.json();
        setRecentLogs((prev) => [newLog, ...prev]);
        // Reset form
        setSelectedExercise(null);
        setQuery("");
        setSets("");
        setReps("");
        setWeightKg("");
      }
    } catch (error) {
      console.error("Failed to log workout:", error);
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="editorial-card p-6 lg:p-8 w-full relative text-on-surface">

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <h2 className="font-headline-md text-[20px] font-bold text-on-surface leading-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">fitness_center</span>
          Log Workout
        </h2>
      </div>

      <form onSubmit={handleLogWorkout} className="space-y-6 relative z-10">
        {/* Exercise Search */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-[12px] font-label-caps text-on-surface-variant mb-2 uppercase tracking-widest">Exercise</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-0 top-3 text-on-surface-variant text-[20px]">search</span>
            <input
              type="text"
              value={selectedExercise ? selectedExercise.name : query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedExercise(null);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="editorial-input block w-full pl-8 pr-10 py-3 text-[14px] outline-none text-on-surface transition-all placeholder:text-on-surface-variant/50"
              placeholder="Search exercises (e.g. Bench Press)..."
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
                <span className="material-symbols-outlined animate-spin text-[16px] text-primary">sync</span>
              </div>
            )}
          </div>
          
          {/* Dropdown */}
          {showDropdown && query && !selectedExercise && (
            <div className="absolute z-20 w-full bg-surface border border-outline-variant shadow-sm max-h-60 overflow-y-auto divide-y divide-outline-variant">
              {results.length > 0 ? (
                results.map((exercise) => (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => {
                      setSelectedExercise(exercise);
                      setQuery(exercise.name);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-surface-variant transition-colors flex flex-col gap-1"
                  >
                    <span className="font-bold text-[14px] text-on-surface">{exercise.name}</span>
                    <span className="flex gap-2">
                      <span className="text-secondary font-label-caps text-[9px] uppercase tracking-widest font-bold">{exercise.muscleGroup}</span>
                      {exercise.equipment && <span className="text-on-surface-variant font-label-caps text-[9px] uppercase tracking-widest font-bold">• {exercise.equipment}</span>}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-4 text-[12px] text-on-surface-variant text-center font-medium italic">
                  {isSearching ? "Searching..." : "No exercises found."}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Set / Reps / Weight Inputs (Only show when exercise is selected) */}
        {selectedExercise && (
          <div className="grid grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div>
              <label className="block text-[12px] font-label-caps text-on-surface-variant mb-2 uppercase tracking-widest">Sets</label>
              <input
                type="number"
                min="1"
                required
                value={sets}
                onChange={(e) => setSets(e.target.value ? Number(e.target.value) : "")}
                className="editorial-input block w-full py-3 text-[14px] outline-none text-on-surface transition-all"
                placeholder="e.g. 3"
              />
            </div>
            <div>
              <label className="block text-[12px] font-label-caps text-on-surface-variant mb-2 uppercase tracking-widest">Reps</label>
              <input
                type="number"
                min="1"
                required
                value={reps}
                onChange={(e) => setReps(e.target.value ? Number(e.target.value) : "")}
                className="editorial-input block w-full py-3 text-[14px] outline-none text-on-surface transition-all"
                placeholder="e.g. 10"
              />
            </div>
            <div>
              <label className="block text-[12px] font-label-caps text-on-surface-variant mb-2 uppercase tracking-widest">Wt (kg)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : "")}
                className="editorial-input block w-full py-3 text-[14px] outline-none text-on-surface transition-all placeholder:text-on-surface-variant/30"
                placeholder="Opt"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedExercise || !sets || !reps || isLogging}
          className="editorial-button w-full mt-2 py-3.5 px-4 font-label-caps text-[12px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLogging ? (
            <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
          ) : (
            <span className="material-symbols-outlined text-[18px]">add</span>
          )}
          {isLogging ? "Logging..." : "Log Workout"}
        </button>
      </form>

      {/* Recent Logs Section */}
      <div className="mt-8 pt-6 border-t border-outline-variant relative z-10">
        <h3 className="font-label-caps text-[12px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Today's Logs</h3>
        {isLoadingLogs ? (
          <div className="flex items-center gap-2 text-[12px] text-on-surface-variant font-label-caps uppercase tracking-widest">
            <span className="material-symbols-outlined animate-spin text-[14px]">sync</span>
            Loading...
          </div>
        ) : recentLogs.length > 0 ? (
          <div className="divide-y divide-outline-variant">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between py-4 group"
              >
                <div>
                  <div className="font-bold text-[14px] text-on-surface mb-1">{log.exercise.name}</div>
                  <div className="text-[12px] text-on-surface-variant">
                    <span className="font-bold text-primary">{log.sets}</span> sets × <span className="font-bold text-primary">{log.reps}</span> reps {log.weightKg ? <span className="text-on-surface ml-1">@ {log.weightKg}kg</span> : ""}
                  </div>
                </div>
                <div className="text-[10px] text-on-surface-variant font-label-caps uppercase font-bold tracking-wider">
                  {new Date(log.performedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-[12px] font-medium text-on-surface-variant italic">
            No workouts logged today yet.
          </div>
        )}
      </div>
    </div>
  );
}
