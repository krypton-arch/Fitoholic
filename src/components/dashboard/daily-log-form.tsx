'use client';

import { useState, useEffect } from 'react';
import { useUpsertLog } from '@/hooks/use-logs';
import { Droplet, Loader2 } from 'lucide-react';

export function DailyLogForm({ defaultDate }: { defaultDate?: string }) {
  const { mutateAsync, isPending } = useUpsertLog();
  
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(defaultDate || today);
  const [steps, setSteps] = useState<number | ''>('');
  const [caloriesBurned, setCaloriesBurned] = useState<number | ''>('');
  const [waterMl, setWaterMl] = useState<number>(0);
  const [weightKg, setWeightKg] = useState<number | ''>('');

  useEffect(() => {
    if (defaultDate) {
      setDate(defaultDate);
    }
  }, [defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutateAsync({
      date,
      steps: steps === '' ? null : Number(steps),
      caloriesBurned: caloriesBurned === '' ? null : Number(caloriesBurned),
      waterMl: waterMl,
      weightKg: weightKg === '' ? null : Number(weightKg),
    });
  };

  const handleWaterClick = (index: number) => {
    setWaterMl((index + 1) * 250);
  };

  return (
    <div className="bg-card rounded-xl border border-white/10 p-6 shadow-xl backdrop-blur-xl">
      <h3 className="text-xl font-outfit font-semibold text-foreground mb-6">Log Metrics</h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Date</label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Steps</label>
            <input 
              type="number" 
              value={steps}
              onChange={(e) => setSteps(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0"
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Calories (kcal)</label>
            <input 
              type="number" 
              value={caloriesBurned}
              onChange={(e) => setCaloriesBurned(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0"
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground">Water Intake ({(waterMl / 1000).toFixed(2)}L)</label>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {Array.from({ length: 8 }).map((_, i) => {
              const active = waterMl >= (i + 1) * 250;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleWaterClick(i)}
                  className="focus:outline-none group relative transition-transform hover:scale-110"
                  title={`${(i + 1) * 250} ml`}
                >
                  <Droplet 
                    className={`w-6 h-6 transition-all duration-300 ${active ? 'text-blue-500 fill-blue-500/30' : 'text-muted-foreground/30 fill-transparent group-hover:text-blue-400/50'}`} 
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Weight (kg)</label>
          <input 
            type="number" 
            step="0.1"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.0"
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Log'}
        </button>
      </form>
    </div>
  );
}
