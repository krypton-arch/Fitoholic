'use client';

import { Activity, Flame, Droplet, Scale } from 'lucide-react';

interface DailyLog {
  date: string;
  steps: number | null;
  caloriesBurned: number | null;
  waterMl: number | null;
  weightKg: number | null;
}

export function TodayOverview({ log }: { log: DailyLog | null }) {
  const metrics = [
    { 
      title: 'Steps', 
      value: log?.steps != null ? log.steps.toLocaleString() : '--', 
      icon: Activity, 
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    { 
      title: 'Calories', 
      value: log?.caloriesBurned != null ? log.caloriesBurned.toLocaleString() : '--', 
      icon: Flame, 
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    },
    { 
      title: 'Water', 
      value: log?.waterMl != null ? `${(log.waterMl / 1000).toFixed(1)}L` : '--', 
      icon: Droplet, 
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    { 
      title: 'Weight', 
      value: log?.weightKg != null ? `${log.weightKg} kg` : '--', 
      icon: Scale, 
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, i) => (
        <div 
          key={metric.title} 
          className="group p-6 rounded-xl bg-card border border-white/10 shadow-lg hover:shadow-xl hover:border-white/20 transition-all duration-300 relative overflow-hidden backdrop-blur-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${metric.bg} ${metric.color} transition-transform duration-300 group-hover:scale-110`}>
              <metric.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium text-muted-foreground text-sm">{metric.title}</h3>
              <div className="text-2xl font-bold font-outfit text-foreground mt-1 tracking-tight">
                {metric.value}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
