import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { FitnessSyncClient } from './fitness-sync-client';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Fitness Sync - Fitoholic',
};

export default async function FitnessSyncPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const token = await prisma.fitnessSyncToken.findUnique({
    where: {
      userId_provider: {
        userId: session.user.id,
        provider: 'google_health'
      }
    }
  });

  return (
    <>
      <header className="mb-8 animate-fade-up">
        <h2 className="font-display-lg text-[36px] md:text-[48px] text-on-background mb-2 tracking-tight font-semibold flex items-center gap-4">
          <span className="material-symbols-outlined text-primary text-[40px]">sync</span>
          Fitness Sync
        </h2>
        <p className="text-on-surface-variant font-body-md max-w-xl">Automatically import your daily activity from external health platforms like Google Fit.</p>
      </header>
      
      <div className="flex-1 w-full max-w-3xl animate-fade-up delay-100">
        <FitnessSyncClient 
          isPremium={session.user.isPremium || session.user.role === 'ADMIN'} 
          isGoogleFitConnected={!!token}
        />
      </div>
    </>
  );
}
