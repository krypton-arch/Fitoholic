import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ProfileForm from './profile-form';

export const metadata = {
  title: 'Profile - Fitoholic',
  description: 'Manage your profile and security settings.',
};

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      bio: true,
      isPremium: true,
      role: true,
      passwordHash: true,
      createdAt: true,
      _count: {
        select: {
          dailyLogs: true,
          mealEntries: true,
          workoutLogs: true,
        },
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="w-full max-w-[900px] mx-auto">
      <ProfileForm
        initialName={user.name || ''}
        initialEmail={user.email}
        initialBio={user.bio || ''}
        hasPassword={!!user.passwordHash}
        isPremium={user.isPremium}
        role={user.role}
        memberSince={user.createdAt.toISOString()}
        stats={{
          logs: user._count.dailyLogs,
          meals: user._count.mealEntries,
          workouts: user._count.workoutLogs,
        }}
      />
    </div>
  );
}
