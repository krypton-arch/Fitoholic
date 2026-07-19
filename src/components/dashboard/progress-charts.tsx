"use client";

import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export function ProgressCharts() {
  const { data: chartData = [], isLoading } = useQuery({
    queryKey: ['progressStats'],
    queryFn: async () => {
      const res = await fetch('/api/progress');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    }
  });

  if (isLoading) return (
    <div className="space-y-8 animate-pulse">
      <div className="h-[400px] bg-surface-container rounded-2xl"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-[300px] bg-surface-container rounded-2xl"></div>
        <div className="h-[300px] bg-surface-container rounded-2xl"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Calories Chart */}
      <div className="glass-card rounded-[24px] p-6 lg:p-8">
        <h3 className="font-headline-md text-[24px] font-bold text-on-surface mb-6">Calorie Intake (Last 7 Days)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#bbcabf" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#bbcabf" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(11, 19, 38, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(12px)' }}
                itemStyle={{ color: '#dae2fd' }}
              />
              <Area type="monotone" dataKey="calories" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCalories)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Weight Chart */}
        <div className="glass-card rounded-[24px] p-6 lg:p-8">
          <h3 className="font-headline-md text-[24px] font-bold text-on-surface mb-6">Weight Progression (kg)</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                 <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#bbcabf" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={['auto', 'auto']} stroke="#bbcabf" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(11, 19, 38, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(12px)' }}
                  itemStyle={{ color: '#dae2fd' }}
                />
                <Area type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workouts Chart */}
        <div className="glass-card rounded-[24px] p-6 lg:p-8">
          <h3 className="font-headline-md text-[24px] font-bold text-on-surface mb-6">Workouts Completed</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#bbcabf" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} stroke="#bbcabf" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(11, 19, 38, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(12px)' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  itemStyle={{ color: '#dae2fd' }}
                />
                <Bar dataKey="workouts" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
