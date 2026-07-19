"use client";

import { useState } from 'react';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { useToast } from '@/components/ui/toast-provider';
import { format, parseISO } from 'date-fns';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional().or(z.literal('')),
  currentPassword: z.string().optional().or(z.literal('')),
  newPassword: z.string().optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.newPassword && data.newPassword.length > 0 && (!data.currentPassword || data.currentPassword.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Current password is required to set a new password",
  path: ["currentPassword"],
});

interface ProfileFormProps {
  initialName: string;
  initialEmail: string;
  initialBio: string;
  hasPassword: boolean;
  isPremium: boolean;
  role: string;
  memberSince: string;
  stats: {
    logs: number;
    meals: number;
    workouts: number;
  };
}

export default function ProfileForm({
  initialName,
  initialEmail,
  initialBio,
  hasPassword,
  isPremium,
  role,
  memberSince,
  stats,
}: ProfileFormProps) {
  const { update } = useSession();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: initialName,
    bio: initialBio,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const userInitials = initialName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationResult = profileSchema.safeParse(formData);

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach(issue => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, string> = {
        name: formData.name,
        bio: formData.bio,
      };

      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      toast('Profile updated.', 'success');

      if (formData.name !== initialName) {
        await update({ name: formData.name });
      }

      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

    } catch (err: unknown) {
      if (err instanceof Error) {
        toast(err.message, 'error');
      } else {
        toast('An unknown error occurred.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
      className="space-y-12"
    >
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 border-b border-outline-variant pb-10">
        <div className="w-20 h-20 flex items-center justify-center text-secondary font-display-lg text-[28px] border border-outline-variant rounded-sm bg-surface-container flex-shrink-0">
          {userInitials}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display-lg text-[32px] md:text-[40px] tracking-tight text-on-surface leading-none mb-2">
            {initialName}
          </h1>
          <p className="font-body-md text-on-surface-variant italic truncate">{initialEmail}</p>
          <div className="flex items-center gap-4 mt-4">
            <span className={`font-label-caps text-[10px] tracking-widest uppercase border px-2 py-1 ${
              isPremium || role === 'ADMIN'
                ? 'text-secondary border-secondary'
                : 'text-on-surface-variant border-outline-variant'
            }`}>
              {role === 'ADMIN' ? 'Admin' : isPremium ? 'Premium' : 'Standard'}
            </span>
            <span className="font-label-caps text-[10px] tracking-widest text-on-surface-variant uppercase">
              Since {format(parseISO(memberSince), 'MMM yyyy')}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 border-y border-outline-variant">
        {[
          { label: 'Daily Logs', value: stats.logs, icon: 'monitoring' },
          { label: 'Meals Logged', value: stats.meals, icon: 'restaurant' },
          { label: 'Workouts', value: stats.workouts, icon: 'fitness_center' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`p-6 md:p-8 flex flex-col items-center justify-center text-center ${
              i < 2 ? 'border-r border-outline-variant' : ''
            }`}
          >
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant font-light mb-3">{stat.icon}</span>
            <p className="font-display-lg text-[28px] md:text-[36px] text-on-surface tracking-tighter leading-none">{stat.value}</p>
            <p className="font-label-caps text-[9px] md:text-[10px] tracking-widest text-on-surface-variant uppercase mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-12">
        {/* General Information */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <span className="material-symbols-outlined text-[20px] text-secondary font-light">person</span>
            <h2 className="font-headline-md text-[24px] text-on-surface tracking-tight uppercase">General</h2>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="block font-label-caps text-[11px] tracking-widest text-on-surface-variant uppercase ml-1">Full Name</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">badge</span>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="editorial-input w-full pl-10 pr-4 py-3 text-on-surface"
                placeholder="Jane Doe"
              />
            </div>
            {errors.name && <p className="text-error text-[11px] font-body-md italic ml-1">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="block font-label-caps text-[11px] tracking-widest text-on-surface-variant uppercase ml-1">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="editorial-input w-full px-4 py-3 text-on-surface resize-none"
              placeholder="Tell us about your fitness journey..."
            />
            <div className="flex justify-between items-center ml-1">
              {errors.bio && <p className="text-error text-[11px] font-body-md italic">{errors.bio}</p>}
              <p className="font-label-caps text-[9px] tracking-widest text-on-surface-variant ml-auto">{formData.bio.length}/500</p>
            </div>
          </div>
        </section>

        {/* Security Section */}
        {hasPassword && (
          <section className="space-y-6 border-t border-outline-variant pt-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-[20px] text-secondary font-light">lock</span>
                <h2 className="font-headline-md text-[24px] text-on-surface tracking-tight uppercase">Security</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="font-label-caps text-[9px] tracking-widest text-on-surface-variant hover:text-secondary transition-colors uppercase"
              >
                {showPassword ? 'Hide Fields' : 'Change Password'}
              </button>
            </div>

            {showPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="block font-label-caps text-[11px] tracking-widest text-on-surface-variant uppercase ml-1">Current Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">key</span>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="editorial-input w-full pl-10 pr-4 py-3 text-on-surface"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.currentPassword && <p className="text-error text-[11px] font-body-md italic ml-1">{errors.currentPassword}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="block font-label-caps text-[11px] tracking-widest text-on-surface-variant uppercase ml-1">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="editorial-input w-full px-4 py-3 text-on-surface"
                      placeholder="••••••••"
                    />
                    {errors.newPassword && <p className="text-error text-[11px] font-body-md italic ml-1">{errors.newPassword}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block font-label-caps text-[11px] tracking-widest text-on-surface-variant uppercase ml-1">Confirm</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="editorial-input w-full px-4 py-3 text-on-surface"
                      placeholder="••••••••"
                    />
                    {errors.confirmPassword && <p className="text-error text-[11px] font-body-md italic ml-1">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </motion.div>
            )}
          </section>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-outline-variant pt-8">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-outline-variant text-on-surface-variant font-label-caps text-[11px] uppercase tracking-widest hover:border-error hover:text-error transition-all active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Sign Out
          </button>

          <button
            type="submit"
            disabled={loading}
            className="editorial-button px-10 py-4 font-label-caps text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.99] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <span className="material-symbols-outlined text-[16px] animate-spin">sync</span> : null}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
