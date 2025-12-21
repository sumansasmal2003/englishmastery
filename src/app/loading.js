"use client";

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-[#000000] transition-colors duration-300">

      {/* --- Central Container --- */}
      <div className="relative flex flex-col items-center justify-center">

        {/* 1. Atmospheric Glow - Increased opacity for visibility in Dark Mode */}
        <div className="absolute w-48 h-48 bg-indigo-500/20 dark:bg-indigo-500/40 blur-[80px] rounded-full pointer-events-none" />

        {/* 2. Logo Box */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          // Uses neutral-900 (dark grey) against pure black background for contrast
          // Added distinct border for dark mode definition
          className="relative z-20 w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800"
        >
            <BookOpen
                size={40}
                className="text-black dark:text-white"
                strokeWidth={1.5}
            />
        </motion.div>

        {/* 3. Text & Loader */}
        <div className="mt-8 relative z-20 text-center space-y-4">
            <h2 className="text-lg font-bold tracking-[0.25em] uppercase font-sans text-black dark:text-white">
                English Mastery
            </h2>

            {/* Progress Bar Container */}
            {/* Dark Mode: Track is translucent white (visible against black), Bar is bright Indigo-400 */}
            <div className="w-32 h-1 bg-gray-100 dark:bg-white/20 rounded-full overflow-hidden mx-auto">
                <motion.div
                    className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full"
                    initial={{ width: "0%", x: "-100%" }}
                    animate={{ width: "50%", x: "200%" }}
                    transition={{
                        duration: 1.2, // Slightly faster for better perceived performance
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>
        </div>
      </div>

      {/* --- Footer Text --- */}
      <p className="absolute bottom-10 text-[10px] font-mono tracking-widest uppercase text-gray-400 dark:text-neutral-500">
        Loading Resources...
      </p>
    </div>
  );
}
