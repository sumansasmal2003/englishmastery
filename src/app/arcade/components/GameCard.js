"use client";
import { motion } from "framer-motion";

export const GameCard = ({ title, icon: Icon, color, onClick, description, gradient }) => (
  <motion.button
    whileHover={{ y: -8, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="relative group overflow-hidden p-8 rounded-[2rem] bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 text-left w-full h-full shadow-xl hover:shadow-2xl transition-all duration-300"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

    <div className={`absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br ${color} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`} />

    <div className="relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${color} text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={28} />
        </div>

        <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-zinc-900 group-hover:to-zinc-500 dark:group-hover:from-white dark:group-hover:to-zinc-400 transition-all">
            {title}
        </h3>

        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[90%]">
            {description}
        </p>
    </div>
  </motion.button>
);
