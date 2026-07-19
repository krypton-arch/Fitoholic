import { WorkoutLogger } from '@/components/dashboard/workout-logger';

export const metadata = {
  title: 'Workouts - Fitoholic',
};

export default function WorkoutsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold font-outfit text-foreground">Workouts</h2>
        <p className="text-muted-foreground mt-1">Log your exercises and track your fitness progress.</p>
      </div>
      
      <div className="max-w-3xl">
        <WorkoutLogger />
      </div>
    </div>
  );
}
