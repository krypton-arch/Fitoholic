'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />;

  const cycleTheme = async () => {
    let newTheme = 'system';
    if (theme === 'system') newTheme = 'dark';
    else if (theme === 'dark') newTheme = 'light';
    
    setTheme(newTheme);
    
    // Simulate API call
    try {
      fetch('/api/user/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme.toUpperCase() })
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors relative overflow-hidden"
      aria-label="Toggle theme"
    >
      <motion.div
        key={theme}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : theme === 'dark' ? <Moon className="w-4 h-4 text-blue-400" /> : <Monitor className="w-4 h-4" />}
      </motion.div>
    </button>
  );
}
