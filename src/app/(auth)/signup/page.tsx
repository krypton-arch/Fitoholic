'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { signupSchema } from '@/lib/validations/auth';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const validation = signupSchema.safeParse({ name, email, password, confirmPassword });
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
      } else {
        router.push('/login?registered=true');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
      className="w-full max-w-md mx-auto"
    >
      <div className="editorial-card p-10 md:p-14">
        <div className="text-center mb-10 border-b border-outline-variant pb-8">
          <h1 className="font-display-lg text-[32px] md:text-[40px] tracking-tight text-on-surface mb-2">Create Account</h1>
          <p className="font-body-md text-on-surface-variant italic">Join Fitoholic's editorial regimen</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-error font-body-md text-[13px] text-center mb-6 italic"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block font-label-caps text-[11px] tracking-widest text-on-surface-variant uppercase ml-1">Full Name</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">person</span>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="editorial-input w-full pl-10 pr-4 py-3 text-on-surface"
                placeholder="Jane Doe"
                required
              />
            </div>
            {fieldErrors.name && <p className="text-error text-[11px] font-body-md italic ml-1">{fieldErrors.name}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block font-label-caps text-[11px] tracking-widest text-on-surface-variant uppercase ml-1">Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">mail</span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="editorial-input w-full pl-10 pr-4 py-3 text-on-surface"
                placeholder="you@example.com"
                required
              />
            </div>
            {fieldErrors.email && <p className="text-error text-[11px] font-body-md italic ml-1">{fieldErrors.email}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block font-label-caps text-[11px] tracking-widest text-on-surface-variant uppercase ml-1">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">lock</span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="editorial-input w-full pl-10 pr-12 py-3 text-on-surface"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                tabIndex={-1}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {fieldErrors.password && <p className="text-error text-[11px] font-body-md italic ml-1">{fieldErrors.password}</p>}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block font-label-caps text-[11px] tracking-widest text-on-surface-variant uppercase ml-1">Confirm Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">lock_reset</span>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="editorial-input w-full pl-10 pr-12 py-3 text-on-surface"
                placeholder="••••••••"
                required
              />
            </div>
            {fieldErrors.confirmPassword && <p className="text-error text-[11px] font-body-md italic ml-1">{fieldErrors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="editorial-button w-full py-4 mt-8 font-label-caps text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <span className="material-symbols-outlined text-[16px] animate-spin">sync</span> : null}
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center font-body-md text-[13px] text-on-surface-variant mt-10">
          Already have an account?{' '}
          <Link href="/login" className="text-secondary italic hover:text-primary transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
