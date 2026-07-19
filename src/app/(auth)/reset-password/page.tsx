'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (token) {
    return <NewPasswordForm token={token} />;
  }

  return <RequestResetForm />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-24">
        <span className="material-symbols-outlined text-[32px] text-secondary animate-spin">sync</span>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

function RequestResetForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
        className="w-full max-w-md mx-auto"
      >
        <div className="editorial-card p-10 md:p-14 text-center">
          <span className="material-symbols-outlined text-[48px] text-secondary font-light mb-6 block">mark_email_read</span>
          <h1 className="font-display-lg text-[28px] md:text-[32px] tracking-tight text-on-surface mb-3">Check Your Email</h1>
          <p className="font-body-md text-on-surface-variant italic mb-8">
            If an account exists with that email, we&apos;ve sent a password reset link.
          </p>
          <Link href="/login" className="font-label-caps text-[11px] tracking-widest text-secondary hover:text-primary transition-colors uppercase border-b border-secondary pb-1">
            Back to Login
          </Link>
        </div>
      </motion.div>
    );
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
          <h1 className="font-display-lg text-[32px] md:text-[40px] tracking-tight text-on-surface mb-2">Reset Password</h1>
          <p className="font-body-md text-on-surface-variant italic">Enter your email to receive a reset link</p>
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
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="editorial-button w-full py-4 mt-8 font-label-caps text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <span className="material-symbols-outlined text-[16px] animate-spin">sync</span> : null}
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center font-body-md text-[13px] text-on-surface-variant mt-8">
          Remember your password?{' '}
          <Link href="/login" className="text-secondary italic hover:text-primary transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

function NewPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
        className="w-full max-w-md mx-auto"
      >
        <div className="editorial-card p-10 md:p-14 text-center">
          <span className="material-symbols-outlined text-[48px] text-secondary font-light mb-6 block">check_circle</span>
          <h1 className="font-display-lg text-[28px] md:text-[32px] tracking-tight text-on-surface mb-3">Password Reset</h1>
          <p className="font-body-md text-on-surface-variant italic mb-8">Your password has been updated successfully.</p>
          <Link
            href="/login"
            className="editorial-button inline-block px-8 py-4 font-label-caps text-[12px] uppercase tracking-widest"
          >
            Sign In
          </Link>
        </div>
      </motion.div>
    );
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
          <h1 className="font-display-lg text-[32px] md:text-[40px] tracking-tight text-on-surface mb-2">New Password</h1>
          <p className="font-body-md text-on-surface-variant italic">Enter your new password below</p>
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
            <label htmlFor="password" className="block font-label-caps text-[11px] tracking-widest text-on-surface-variant uppercase ml-1">New Password</label>
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
                className="editorial-input w-full pl-10 pr-4 py-3 text-on-surface"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="editorial-button w-full py-4 mt-8 font-label-caps text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <span className="material-symbols-outlined text-[16px] animate-spin">sync</span> : null}
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
