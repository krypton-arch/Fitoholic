'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const firstName = session?.user?.name?.split(' ')[0] || 'Athlete';
  
  const title = pathname === '/dashboard' ? 'Overview' 
    : pathname?.split('/').pop()?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Overview';

  return (
    <header className="sticky top-0 z-20 h-16 md:h-24 bg-surface/90 backdrop-blur-md flex items-center justify-between px-4 md:px-12 border-b border-outline-variant transition-colors">
      <h1 className="text-xl md:text-3xl font-headline-md tracking-tight text-on-surface uppercase">{title}</h1>
      
      <div className="flex items-center gap-6">
        <div className="md:hidden">
          <ThemeToggle />
        </div>
        
        <button className="relative p-2 text-on-surface-variant hover:text-secondary transition-colors group">
          <span className="material-symbols-outlined text-[20px] font-light group-hover:scale-105 transition-transform">notifications</span>
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-secondary rounded-full"></span>
        </button>
        
        <Link 
          href="/dashboard/profile"
          className="hidden md:flex items-center gap-3 group cursor-pointer hover:text-secondary transition-colors"
        >
          <span className="material-symbols-outlined text-[18px] font-light text-on-surface-variant group-hover:text-secondary transition-colors">person</span>
          <span className="font-label-caps text-xs tracking-widest text-on-surface-variant group-hover:text-secondary transition-colors uppercase">
            {firstName}
          </span>
        </Link>
      </div>
    </header>
  );
}

