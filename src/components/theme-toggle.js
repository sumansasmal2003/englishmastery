"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 hover:scale-110 transition-transform active:scale-95 group"
      aria-label="Toggle Theme"
    >
      <div className="relative w-5 h-5">
        {/* Sun Icon (Show when Light) */}
        <motion.div
          initial={{ opacity: 0, rotate: -90 }}
          animate={{
            opacity: theme === 'light' ? 1 : 0,
            rotate: theme === 'light' ? 0 : 90,
            scale: theme === 'light' ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sun className="w-5 h-5 text-amber-500" fill="currentColor" />
        </motion.div>

        {/* Moon Icon (Show when Dark) */}
        <motion.div
          initial={{ opacity: 0, rotate: 90 }}
          animate={{
            opacity: theme === 'dark' ? 1 : 0,
            rotate: theme === 'dark' ? 0 : -90,
            scale: theme === 'dark' ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Moon className="w-5 h-5 text-indigo-400" fill="currentColor" />
        </motion.div>
      </div>
    </button>
  );
}
