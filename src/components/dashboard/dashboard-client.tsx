'use client';

import { useLogs } from '@/hooks/use-logs';
import { useMemo, useState } from 'react';
import { MetricChart } from '@/components/charts/metric-chart';

export function DashboardClient({ userName }: { userName: string }) {
  const { data: logs = [], isLoading } = useLogs();
  const [weight, setWeight] = useState('');
  const [sleep, setSleep] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayLog = useMemo(() => logs.find((l: any) => l.date.split('T')[0] === today) || null, [logs, today]);

  const chartData = useMemo(() => {
    return [...logs].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [logs]);

  const steps = todayLog?.steps || 0;
  const calories = todayLog?.caloriesBurned || 0;
  const water = todayLog?.waterMl || 0;
  const waterLiters = (water / 1000).toFixed(1);

  const goalPercentage = Math.min(100, Math.round((steps / 10000) * 100)) || 0;

  if (isLoading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto animate-pulse">
        <div className="mb-12 md:mb-20">
          <div className="h-16 md:h-24 w-2/3 lg:w-1/2 bg-surface-container-high mb-6"></div>
          <div className="flex items-center gap-6 mt-8">
            <div className="h-3 w-24 bg-surface-container-high"></div>
            <div className="w-32 h-[1px] bg-outline-variant"></div>
            <div className="h-3 w-8 bg-surface-container-high"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 border-y border-outline-variant mb-20">
          <div className="h-48 md:h-64 md:border-r border-b md:border-b-0 border-outline-variant bg-surface-container-lowest"></div>
          <div className="h-48 md:h-64 md:border-r border-b md:border-b-0 border-outline-variant bg-surface-container-lowest"></div>
          <div className="h-48 md:h-64 bg-surface-container-lowest"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto">
      
      {/* Hero Greeting */}
      <div className="mb-12 md:mb-20 animate-fade-up">
        <h2 className="font-display-lg text-[40px] md:text-[64px] text-on-surface mb-4 md:mb-6 leading-[1.1] tracking-tight">
          Welcome back,<br/><span className="italic font-light text-secondary">{userName}.</span>
        </h2>
        <div className="flex items-center gap-6 mt-8">
          <p className="font-body-md text-on-surface-variant uppercase tracking-widest text-xs">Daily Progress</p>
          <div className="w-32 h-[1px] bg-outline-variant"></div>
          <p className="font-label-caps text-secondary text-sm tracking-widest">{goalPercentage}%</p>
        </div>
      </div>

      {/* Editorial Stats Row (No Boxes, Just Lines) */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-y border-outline-variant animate-fade-up delay-100 mb-20">
        
        {/* Steps */}
        <div className="p-8 md:p-12 md:border-r border-b md:border-b-0 border-outline-variant flex flex-col justify-between group transition-colors hover:bg-surface-container-lowest">
          <div className="flex justify-between items-start mb-16">
            <p className="font-label-caps text-[11px] text-on-surface-variant tracking-widest uppercase">Movement</p>
            <span className="material-symbols-outlined text-on-surface-variant font-light text-[20px]">directions_run</span>
          </div>
          <div className="w-full overflow-hidden">
            <h3 className="font-display-lg text-[40px] lg:text-[56px] text-on-surface leading-none tracking-tighter group-hover:text-secondary transition-colors truncate">
              {steps.toLocaleString()}
            </h3>
            <p className="font-body-md text-on-surface-variant mt-4 italic text-lg">steps today</p>
          </div>
        </div>

        {/* Calories */}
        <div className="p-8 md:p-12 md:border-r border-b md:border-b-0 border-outline-variant flex flex-col justify-between group transition-colors hover:bg-surface-container-lowest">
          <div className="flex justify-between items-start mb-16">
            <p className="font-label-caps text-[11px] text-on-surface-variant tracking-widest uppercase">Energy</p>
            <span className="material-symbols-outlined text-on-surface-variant font-light text-[20px]">local_fire_department</span>
          </div>
          <div className="w-full overflow-hidden">
            <h3 className="font-display-lg text-[40px] lg:text-[56px] text-on-surface leading-none tracking-tighter group-hover:text-primary transition-colors truncate">
              {calories.toLocaleString()}
            </h3>
            <p className="font-body-md text-on-surface-variant mt-4 italic text-lg">kcal burned</p>
          </div>
        </div>

        {/* Water */}
        <div className="p-8 md:p-12 flex flex-col justify-between group relative overflow-hidden transition-colors hover:bg-surface-container-lowest">
          <div className="flex justify-between items-start mb-16 z-10">
            <p className="font-label-caps text-[11px] text-on-surface-variant tracking-widest uppercase">Hydration</p>
            <span className="material-symbols-outlined text-on-surface-variant font-light text-[20px]">water_drop</span>
          </div>
          <div className="z-10 w-full overflow-hidden">
            <h3 className="font-display-lg text-[40px] lg:text-[56px] text-on-surface leading-none tracking-tighter group-hover:text-[#3b82f6] transition-colors truncate">
              {waterLiters}
            </h3>
            <p className="font-body-md text-on-surface-variant mt-4 italic text-lg">liters / 4.0 L</p>
          </div>
          {/* Subtle line indicator for water instead of liquid fill to match editorial style */}
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-outline-variant z-0">
             <div className="h-full bg-[#3b82f6] transition-all duration-1000 ease-in-out" style={{ width: `${Math.min(100, (water / 4000) * 100)}%` }}></div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-24">
        {/* Main Analytics */}
        <div className="col-span-1 md:col-span-8 animate-fade-up delay-200">
          <div className="flex justify-between items-end mb-10 border-b border-outline-variant pb-6">
            <h3 className="font-headline-md text-3xl text-on-surface tracking-tight uppercase">Performance</h3>
            <div className="flex gap-6">
              <span className="font-label-caps text-[11px] tracking-widest text-secondary cursor-pointer border-b border-secondary pb-1">WEEK</span>
              <span className="font-label-caps text-[11px] tracking-widest text-on-surface-variant cursor-pointer hover:text-on-surface transition-colors pb-1">MONTH</span>
            </div>
          </div>
          
          <div className="h-[350px] w-full pt-4">
            <MetricChart 
              title="" 
              data={chartData} 
              dataKey="steps" 
              color="#d4af37" 
            />
          </div>
        </div>

        {/* Quick Log Widget */}
        <div className="col-span-1 md:col-span-4 animate-fade-up delay-300">
          <h3 className="font-headline-md text-3xl text-on-surface mb-10 border-b border-outline-variant pb-6 tracking-tight uppercase">Journal</h3>
          
          <div className="space-y-10 mt-4">
            
            {/* Weight Input */}
            <div className="group">
              <label className="font-label-caps text-[11px] tracking-widest text-on-surface-variant mb-4 block uppercase">Body Weight</label>
              <div className="flex items-end justify-between border-b border-outline-variant pb-3 group-focus-within:border-secondary transition-colors">
                <input 
                  className="bg-transparent border-none text-on-surface font-display-lg text-[32px] md:text-[40px] p-0 flex-1 min-w-0 focus:ring-0 placeholder:text-outline-variant tracking-tighter" 
                  type="number" 
                  placeholder="78.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
                <span className="font-body-md text-on-surface-variant italic mb-2 md:mb-3 text-lg ml-2 flex-shrink-0">kg</span>
              </div>
            </div>

            {/* Sleep Input */}
            <div className="group">
              <label className="font-label-caps text-[11px] tracking-widest text-on-surface-variant mb-4 block uppercase">Sleep Duration</label>
              <div className="flex items-end justify-between border-b border-outline-variant pb-3 group-focus-within:border-primary transition-colors">
                <input 
                  className="bg-transparent border-none text-on-surface font-display-lg text-[32px] md:text-[40px] p-0 flex-1 min-w-0 focus:ring-0 placeholder:text-outline-variant tracking-tighter" 
                  type="text" 
                  placeholder="7h 30m"
                  value={sleep}
                  onChange={(e) => setSleep(e.target.value)}
                />
                <span className="material-symbols-outlined text-on-surface-variant font-light mb-2 md:mb-3 text-[24px] ml-2 flex-shrink-0">bedtime</span>
              </div>
            </div>
            
            <button className="editorial-button w-full font-label-caps text-xs py-5 transition-transform uppercase tracking-widest mt-12 active:scale-[0.99]">
              Commit Entry
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
