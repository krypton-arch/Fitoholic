'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useLogs, useUpsertLog } from '@/hooks/use-logs';
import { MealLogger } from '@/components/dashboard/meal-logger';
import { WorkoutLogger } from '@/components/dashboard/workout-logger';
import { useToast } from '@/components/ui/toast-provider';

type Tab = 'METRICS' | 'MEALS' | 'WORKOUTS';

export default function LogsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('METRICS');
  
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [weightKg, setWeightKg] = useState('');
  const [steps, setSteps] = useState('');
  const [waterMl, setWaterMl] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { data: logs = [], isLoading } = useLogs();
  const upsertLog = useUpsertLog();

  const { toast } = useToast();

  // Populate form if there's a log for the selected date
  useEffect(() => {
    if (!logs.length) return;
    
    // Find log for the current selected date
    const logForDate = logs.find((log: any) => {
      // log.date might be an ISO string
      const logDate = log.date.split('T')[0];
      return logDate === date;
    });

    if (logForDate) {
      setWeightKg(logForDate.weightKg?.toString() || '');
      setSteps(logForDate.steps?.toString() || '');
      setWaterMl(logForDate.waterMl?.toString() || '');
      setCaloriesBurned(logForDate.caloriesBurned?.toString() || '');
    } else {
      setWeightKg('');
      setSteps('');
      setWaterMl('');
      setCaloriesBurned('');
    }
  }, [date, logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertLog.mutate({
      date: new Date(date).toISOString(),
      weightKg: weightKg ? parseFloat(weightKg) : null,
      steps: steps ? parseInt(steps, 10) : null,
      waterMl: waterMl ? parseInt(waterMl, 10) : null,
      caloriesBurned: caloriesBurned ? parseInt(caloriesBurned, 10) : null,
    }, {
      onSuccess: () => {
        toast('Metrics recorded successfully.', 'success');
      },
      onError: () => {
        toast('Failed to record metrics.', 'error');
      }
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="h-full w-full max-w-[1400px] mx-auto flex flex-col space-y-8 text-on-surface">
      
      {/* Header Section */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-2 flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
      >
        <div>
          <h2 className="font-display-lg text-[36px] md:text-[48px] text-on-background mb-2 tracking-tight font-semibold flex items-center gap-4">
            <span className="material-symbols-outlined text-primary text-[40px]">book_4</span>
            Log Book
          </h2>
          <p className="text-on-surface-variant font-body-md max-w-xl">
            Your central hub for tracking daily metrics, nutrition, and workouts.
          </p>
        </div>
      </motion.header>

      {/* Tabs Navigation */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex w-full max-w-2xl mx-auto md:mx-0 border-b border-outline-variant"
      >
        <button
          onClick={() => setActiveTab('METRICS')}
          className={`flex-1 py-4 px-6 font-label-caps text-[12px] uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'METRICS' 
              ? 'text-secondary border-b border-secondary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">monitor_heart</span>
          Metrics
        </button>
        <button
          onClick={() => setActiveTab('MEALS')}
          className={`flex-1 py-4 px-6 font-label-caps text-[12px] uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'MEALS' 
              ? 'text-secondary border-b border-secondary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">restaurant</span>
          Meals
        </button>
        <button
          onClick={() => setActiveTab('WORKOUTS')}
          className={`flex-1 py-4 px-6 font-label-caps text-[12px] uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'WORKOUTS' 
              ? 'text-secondary border-b border-secondary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">fitness_center</span>
          Workouts
        </button>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'METRICS' && (
          <motion.div 
            key="metrics"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-8"
          >
            {/* Quick Add Form */}
            <motion.div variants={itemVariants} className="xl:col-span-1">
              <div className="editorial-card p-6 lg:p-8 relative">
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <h3 className="font-headline-md text-[20px] font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
                    Log Metrics
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <label className="text-[12px] font-label-caps text-on-surface-variant ml-1 uppercase tracking-widest">Date</label>
                    <input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="editorial-input w-full py-2 text-on-surface outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[12px] font-label-caps text-on-surface-variant ml-1 uppercase tracking-widest flex items-center gap-1">
                        Weight
                      </label>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.1"
                          placeholder="0.0"
                          value={weightKg}
                          onChange={(e) => setWeightKg(e.target.value)}
                          className="editorial-input w-full pr-8 py-2 text-on-surface outline-none"
                        />
                        <span className="absolute right-0 top-2 text-xs font-semibold text-on-surface-variant">kg</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[12px] font-label-caps text-on-surface-variant ml-1 uppercase tracking-widest flex items-center gap-1">
                        Steps
                      </label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={steps}
                        onChange={(e) => setSteps(e.target.value)}
                        className="editorial-input w-full py-2 text-on-surface outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[12px] font-label-caps text-on-surface-variant ml-1 uppercase tracking-widest flex items-center gap-1">
                        Water
                      </label>
                      <div className="relative">
                        <input 
                          type="number" 
                          placeholder="0"
                          value={waterMl}
                          onChange={(e) => setWaterMl(e.target.value)}
                          className="editorial-input w-full pr-8 py-2 text-on-surface outline-none"
                        />
                        <span className="absolute right-0 top-2 text-xs font-semibold text-on-surface-variant">ml</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[12px] font-label-caps text-on-surface-variant ml-1 uppercase tracking-widest flex items-center gap-1">
                        Calories
                      </label>
                      <div className="relative">
                        <input 
                          type="number" 
                          placeholder="0"
                          value={caloriesBurned}
                          onChange={(e) => setCaloriesBurned(e.target.value)}
                          className="editorial-input w-full pr-12 py-2 text-on-surface outline-none"
                        />
                        <span className="absolute right-0 top-2 text-xs font-semibold text-on-surface-variant">kcal</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={upsertLog.isPending}
                    className="editorial-button w-full mt-6 py-3.5 px-4 font-label-caps text-[12px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.99] transition-transform"
                  >
                    {upsertLog.isPending ? (
                      <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">save</span>
                    )}
                    {upsertLog.isPending ? 'Saving...' : 'Save Metrics'}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Historical Logs Data Table */}
            <motion.div variants={itemVariants} className="xl:col-span-2">
              <div className="editorial-card p-6 lg:p-8 h-full flex flex-col relative">
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <h2 className="font-headline-md text-[20px] font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[20px]">history</span>
                    Metrics History
                  </h2>
                </div>
                
                <div className="flex-1 overflow-x-auto relative z-10">
                  {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-on-surface-variant space-y-4 py-12">
                      <span className="material-symbols-outlined text-[32px] text-primary animate-spin">sync</span>
                      <p className="font-label-caps text-[12px] uppercase tracking-widest">Loading history...</p>
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-on-surface-variant space-y-6 py-24">
                      <span className="material-symbols-outlined text-[48px] font-extralight text-outline-variant">history</span>
                      <div className="text-center">
                        <p className="font-display-lg text-[24px] text-on-surface mb-2">No History</p>
                        <p className="font-body-md text-on-surface-variant italic">Start your editorial regimen today.</p>
                      </div>
                    </div>
                  ) : (
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead>
                        <tr className="text-on-surface-variant border-b border-outline-variant font-label-caps text-[10px] uppercase tracking-widest">
                          <th className="pb-4 font-bold pl-2">Date</th>
                          <th className="pb-4 font-bold text-center">Weight</th>
                          <th className="pb-4 font-bold text-center">Steps</th>
                          <th className="pb-4 font-bold text-center">Water</th>
                          <th className="pb-4 font-bold text-center">Calories</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log: any, i: number) => {
                          const logDateStr = log.date.split('T')[0];
                          return (
                            <motion.tr 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              key={log.id || log.date} 
                              className="border-b border-outline-variant last:border-0 hover:bg-surface-container-lowest transition-colors cursor-default"
                            >
                              <td className="py-4 pl-2">
                                <div className="font-medium text-on-surface">
                                  {format(parseISO(log.date), 'MMM dd, yyyy')}
                                </div>
                                {logDateStr === format(new Date(), 'yyyy-MM-dd') && (
                                  <span className="text-[9px] uppercase font-bold tracking-wider text-primary ml-2">Today</span>
                                )}
                              </td>
                              <td className="py-4 text-center">
                                {log.weightKg ? (
                                  <span className="inline-flex items-center gap-1 text-on-surface">
                                    {log.weightKg} <span className="text-[10px] text-on-surface-variant">kg</span>
                                  </span>
                                ) : <span className="text-on-surface-variant">-</span>}
                              </td>
                              <td className="py-4 text-center">
                                {log.steps ? (
                                  <span className="inline-flex items-center gap-1 text-on-surface">
                                    {log.steps.toLocaleString()}
                                  </span>
                                ) : <span className="text-on-surface-variant">-</span>}
                              </td>
                              <td className="py-4 text-center">
                                {log.waterMl ? (
                                  <span className="inline-flex items-center gap-1 text-on-surface">
                                    {log.waterMl} <span className="text-[10px] text-on-surface-variant">ml</span>
                                  </span>
                                ) : <span className="text-on-surface-variant">-</span>}
                              </td>
                              <td className="py-4 text-center">
                                {log.caloriesBurned ? (
                                  <span className="inline-flex items-center gap-1 text-on-surface">
                                    {log.caloriesBurned} <span className="text-[10px] text-on-surface-variant">kcal</span>
                                  </span>
                                ) : <span className="text-on-surface-variant">-</span>}
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'MEALS' && (
          <motion.div 
            key="meals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl"
          >
            <MealLogger />
          </motion.div>
        )}

        {activeTab === 'WORKOUTS' && (
          <motion.div 
            key="workouts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl"
          >
            <WorkoutLogger />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

