import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col relative z-0 overflow-y-auto">
      <div className="grain-overlay"></div>

      <header className="px-6 md:px-12 h-24 flex items-center justify-center border-b border-outline-variant relative z-10 flex-shrink-0">
        <div className="w-full max-w-[1400px] flex items-center justify-between">
          <Link href="/" className="font-headline-md text-2xl font-normal text-on-surface uppercase tracking-tight hover:text-secondary transition-colors">
            Fitoholic
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="font-label-caps text-[11px] tracking-widest text-on-surface-variant hover:text-on-surface transition-colors uppercase">
              Login
            </Link>
            <Link href="/signup" className="editorial-button px-6 py-3 font-label-caps text-[11px] uppercase tracking-widest text-on-primary">
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        {children}
      </main>

      <footer className="px-6 md:px-12 py-6 border-t border-outline-variant flex items-center justify-center relative z-10 flex-shrink-0">
        <div className="w-full max-w-[1400px] flex items-center justify-between">
          <span className="font-label-caps text-[9px] tracking-widest text-on-surface-variant uppercase">© {new Date().getFullYear()} Fitoholic</span>
          <Link href="/" className="font-label-caps text-[9px] tracking-widest text-on-surface-variant hover:text-secondary transition-colors uppercase">
            Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
