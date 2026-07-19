import { ProgressCharts } from '@/components/dashboard/progress-charts';

export const metadata = {
  title: 'Progress & Analytics - Fitoholic',
};

export default function ProgressPage() {
  return (
    <>
      <header className="mb-8 animate-fade-up">
        <h2 className="font-display-lg text-[36px] md:text-[48px] text-on-background mb-2 tracking-tight font-semibold flex items-center gap-4">
          <span className="material-symbols-outlined text-primary text-[40px]">monitoring</span>
          Analytics
        </h2>
        <p className="text-on-surface-variant font-body-md max-w-xl">Deep dive into your performance metrics and body composition trends.</p>
      </header>
      
      <div className="flex-1 w-full max-w-5xl animate-fade-up delay-100">
        <ProgressCharts />
      </div>
    </>
  );
}
