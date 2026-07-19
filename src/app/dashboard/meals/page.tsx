import { MealLogger } from '@/components/dashboard/meal-logger';

export const metadata = {
  title: 'Meals - Fitoholic',
};

export default function MealsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold font-outfit text-foreground">Meals</h2>
        <p className="text-muted-foreground mt-1">Track your nutrition and log your daily meals.</p>
      </div>
      
      <div className="max-w-3xl">
        <MealLogger />
      </div>
    </div>
  );
}
