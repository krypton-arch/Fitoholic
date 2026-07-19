'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { name: 'AI Coach', href: '/dashboard/chat', icon: 'smart_toy', isPro: true },
  { name: 'Planners', href: '/dashboard/meal-planner', icon: 'event_note' },
  { name: 'Activity', href: '/dashboard/fitness-sync', icon: 'monitoring' },
  { name: 'Logbook', href: '/dashboard/logs', icon: 'edit_note' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name || 'User';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const isPremium = session?.user?.isPremium || false;

  return (
    <>


      {/* SideNavBar (Desktop) */}
      <nav className="hidden lg:flex flex-col h-full py-8 bg-surface border-r border-outline-variant w-72 flex-shrink-0 z-40">
        <div className="px-8 mb-12 flex flex-col items-start mt-4">
          <div className="flex items-center gap-4 mb-8 w-full border-b border-outline-variant pb-6">
            <div className="w-10 h-10 flex items-center justify-center text-primary font-body-md shrink-0 border border-outline-variant rounded-sm">
              {userInitials}
            </div>
            <div>
              <h1 className="font-headline-md text-lg text-on-surface tracking-normal uppercase">Fitoholic</h1>
              <p className="font-label-caps text-[10px] text-on-surface-variant tracking-widest mt-1">{isPremium ? 'Editorial' : 'Standard'}</p>
            </div>
          </div>
          <Link href="/dashboard/logs" className="w-full text-center border border-outline-variant text-on-surface font-label-caps text-xs py-3 hover:text-secondary hover:border-secondary transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[16px]">add</span>
            NEW ENTRY
          </Link>
        </div>

        <div className="flex-1 px-8 space-y-4 overflow-y-auto hide-scroll">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={cn("flex items-center gap-4 px-4 py-3 -mx-4 rounded-sm transition-all duration-300 relative group", isActive ? "text-secondary bg-surface-container/50" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/30")}>
                {isActive && <span className="absolute -left-4 top-0 bottom-0 w-[2px] bg-secondary"></span>}
                <span className="material-symbols-outlined text-[18px] font-light">{item.icon}</span>
                <span className="font-label-caps text-[11px] tracking-widest flex-1 uppercase">{item.name}</span>
                {item.isPro && (
                  <span className="text-[9px] font-label-caps text-secondary tracking-widest border border-secondary px-1 py-0.5">PRO</span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="px-8 mt-auto space-y-4 pt-8 border-t border-outline-variant">
          <div className="flex items-center justify-between py-2">
            <span className="font-label-caps text-[11px] text-on-surface-variant tracking-widest uppercase">Theme</span>
            <ThemeToggle />
          </div>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full flex items-center gap-4 px-4 py-3 -mx-4 rounded-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container/30 transition-all duration-300 group">
            <span className="material-symbols-outlined text-[18px] font-light group-hover:text-error transition-colors">logout</span>
            <span className="font-label-caps text-[11px] tracking-widest uppercase">Logout</span>
          </button>
        </div>
      </nav>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 pb-safe bg-surface border-t border-outline-variant">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={cn("flex flex-col items-center justify-center p-2 relative", isActive ? "text-secondary" : "text-on-surface-variant")}>
              {isActive && <span className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-secondary"></span>}
              <span className="material-symbols-outlined mb-1 text-[20px] font-light mt-1">{item.icon}</span>
              <span className="font-label-caps text-[9px] tracking-widest uppercase">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
