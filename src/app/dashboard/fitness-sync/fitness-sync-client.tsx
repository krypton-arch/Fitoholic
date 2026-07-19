"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Activity, CheckCircle2, Lock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export function FitnessSyncClient({ isPremium, isGoogleFitConnected }: { isPremium: boolean, isGoogleFitConnected: boolean }) {
  const queryClient = useQueryClient();
  const [syncData, setSyncData] = useState<any>(null);

  const { mutate: syncGoogleFit, isPending, error } = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/sync/google-fit', { method: 'POST' });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details?.error?.message || errorData.error || 'Sync failed');
      }
      return res.json();
    },
    onSuccess: (data) => {
      setSyncData(data.data);
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      queryClient.invalidateQueries({ queryKey: ['progressStats'] });
    }
  });

  const handleConnect = () => {
    window.location.href = '/api/sync/google-fit/authorize';
  };

  if (!isPremium) {
    return (
      <div className="glass-card rounded-[24px] p-8 text-center flex flex-col items-center justify-center min-h-[400px] animate-fade-up delay-100">
        <div className="w-20 h-20 bg-[#10b981]/10 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[#10b981] text-[40px]">lock</span>
        </div>
        <h3 className="text-2xl font-bold font-outfit mb-3 text-on-surface">Premium Feature</h3>
        <p className="text-on-surface-variant max-w-md mb-8">
          Upgrade to Fitoholic Premium to automatically sync your daily steps and health metrics from Google Fit and Apple Health.
        </p>
        <Link 
          href="/dashboard/profile" 
          className="bg-primary text-on-primary-container px-8 py-3 rounded-[20px] font-bold hover:bg-primary-fixed transition-colors shadow-[0_0_15px_rgba(78,222,163,0.4)]"
        >
          Upgrade to PRO
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-[24px] p-6 lg:p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
          <span className="material-symbols-outlined text-primary text-[120px]">sync</span>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between relative z-10 gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-[#3b82f6]/10 flex items-center justify-center border border-[#3b82f6]/20">
                <span className="material-symbols-outlined text-[#3b82f6] text-[24px]">vital_signs</span>
              </div>
              <h3 className="font-headline-md text-[24px] font-bold text-on-surface">Google Fit</h3>
            </div>
            <p className="text-on-surface-variant text-[14px] max-w-md mt-2">
              Sync your daily steps and walking distance automatically from your Google account.
            </p>
          </div>
          
          {!isGoogleFitConnected ? (
            <button 
              onClick={handleConnect}
              className="flex items-center space-x-2 px-6 py-2.5 bg-primary hover:bg-primary-fixed text-on-primary-container font-label-caps text-[12px] uppercase tracking-widest font-bold rounded-[20px] transition-colors shadow-[0_0_15px_rgba(78,222,163,0.4)]"
            >
              <span>Connect Google Fit</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button 
                onClick={handleConnect}
                className="flex items-center space-x-2 px-6 py-2.5 bg-secondary/20 hover:bg-secondary/30 text-secondary font-label-caps text-[12px] uppercase tracking-widest font-bold rounded-[20px] transition-colors"
              >
                <span>Reconnect</span>
              </button>
              <button 
                onClick={() => syncGoogleFit()}
                disabled={isPending}
                className="flex items-center space-x-2 px-6 py-2.5 bg-primary hover:bg-primary-fixed text-on-primary-container font-label-caps text-[12px] uppercase tracking-widest font-bold rounded-[20px] transition-colors shadow-[0_0_15px_rgba(78,222,163,0.4)] disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-[16px] ${isPending ? 'animate-spin' : ''}`}>sync</span>
                <span>{isPending ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-[14px]">
            <span className="font-bold">Sync Error: </span> {error.message}
          </div>
        )}

        {syncData && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-4"
          >
            <div className="bg-surface-container-low rounded-[20px] p-4 flex flex-col justify-center items-center border border-white/5">
              <p className="text-[12px] text-on-surface-variant font-medium">Steps Synced</p>
              <p className="text-[32px] font-bold text-on-surface mt-1 neon-glow">{syncData.steps.toLocaleString()}</p>
            </div>
            <div className="bg-surface-container-low rounded-[20px] p-4 flex flex-col justify-center items-center border border-white/5">
              <p className="text-[12px] text-on-surface-variant font-medium">Distance</p>
              <p className="text-[32px] font-bold text-on-surface mt-1 neon-glow">{syncData.distanceKm} <span className="text-[14px] font-normal text-on-surface-variant">km</span></p>
            </div>
            <div className="col-span-2 flex items-center justify-center text-[12px] text-primary mt-2 space-x-2">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Last synced: {new Date(syncData.lastSync).toLocaleTimeString()}</span>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Apple Health Placeholder */}
      <div className="glass-card rounded-[24px] p-6 lg:p-8 relative overflow-hidden opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between relative z-10 gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <span className="material-symbols-outlined text-rose-500 text-[24px]">favorite</span>
              </div>
              <h3 className="font-headline-md text-[24px] font-bold text-on-surface">Apple Health</h3>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-secondary/20 text-secondary uppercase tracking-wider border border-secondary/20">Coming Soon</span>
            </div>
            <p className="text-on-surface-variant text-[14px] max-w-md mt-2">
              Apple HealthKit integration is currently in beta.
            </p>
          </div>
          
          <button disabled className="px-6 py-2.5 bg-surface-variant text-on-surface-variant font-label-caps text-[12px] uppercase tracking-widest font-bold rounded-[20px] opacity-50 cursor-not-allowed">
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}
