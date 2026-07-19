import { auth } from '@/lib/auth';
import { MealPlannerClient } from './meal-planner-client';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = {
  title: 'AI Meal Planner - Fitoholic',
};

export default async function MealPlannerPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const isPremium = session.user.role === 'ADMIN' || session.user.isPremium;

  return (
    <>
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-fade-up">
        <div>
          <h2 className="font-display-lg text-[36px] md:text-[48px] text-on-background mb-2 tracking-tight font-semibold">AI Planner</h2>
          <p className="text-on-surface-variant font-body-md max-w-xl">Intelligent 7-day protocols generated for maximum hypertrophy and optimal recovery.</p>
        </div>
        <div className="flex bg-surface-container-low rounded-[24px] p-1 border border-white/5">
          <Link href="/dashboard/meal-planner" className="px-6 py-2 rounded-[20px] bg-surface-variant text-primary font-label-caps text-[10px] uppercase font-bold tracking-widest shadow-sm">
            Meal Plan
          </Link>
          <Link href="/dashboard/workout-planner" className="px-6 py-2 rounded-[20px] text-on-surface-variant font-label-caps text-[10px] uppercase font-bold tracking-widest hover:text-on-surface transition-colors">
            Workout Split
          </Link>
        </div>
      </header>

      {!isPremium ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center glass-card rounded-[24px] max-w-2xl mx-auto w-full animate-fade-up delay-100">
          <div className="w-16 h-16 rounded-full bg-[#10b981]/10 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[#10b981] text-3xl">workspace_premium</span>
          </div>
          <h3 className="text-2xl font-bold mb-4 text-on-surface">Premium Feature</h3>
          <p className="text-on-surface-variant mb-8 text-lg">
            Upgrade to Premium to get AI-generated, personalized 7-day meal plans tailored exactly to your fitness goals.
          </p>
          <Link 
            href="/dashboard/profile" 
            className="bg-primary text-on-primary-container px-8 py-3 rounded-full font-medium hover:bg-primary-fixed transition-colors shadow-[0_0_15px_rgba(78,222,163,0.4)]"
          >
            Upgrade Now
          </Link>
        </div>
      ) : (
        <MealPlannerClient />
      )}
    </>
  );
}
