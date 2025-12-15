"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Book, X, ChevronRight, Loader2, Command, Sparkles, BookOpen } from "lucide-react";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } },
};

export default function Home() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    async function fetchChapters() {
      try {
        const res = await fetch("/api/chapters");
        const data = await res.json();
        if (data.success) {
          setChapters(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch chapters", error);
      } finally {
        setLoading(false);
      }
    }
    fetchChapters();
  }, []);

  const classChapters = chapters.filter((ch) => ch.classLevel === selectedClass);
  const classes = [5, 6, 7, 8, 9, 10];

  return (
    // Base bg is white/zinc-50, Dark bg is black
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200">

      {/* --- Navbar --- */}
      <header className="fixed top-0 inset-x-0 z-40 border-b border-zinc-200/50 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:border-white/5 dark:bg-black/80 dark:supports-[backdrop-filter]:bg-black/60 transition-colors">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="font-semibold text-sm tracking-wide text-zinc-800 dark:text-zinc-100">EnglishMastery</span>
          </div>

          <Link
            href="/add-chapter"
            className="group flex items-center gap-2 px-4 py-2 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 hover:border-zinc-300 text-zinc-600 dark:text-zinc-400 dark:hover:text-white dark:bg-zinc-900/50 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:hover:border-zinc-700 rounded-full transition-all duration-300"
          >
            <Command size={13} className="text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            <span>Admin Panel</span>
          </Link>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">

        {/* Hero Section */}
        <div className="mb-20 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-zinc-900 dark:text-white">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-500">
                Academic Curriculum
              </span>
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl leading-relaxed">
              Select a grade level below to access structured chapters, translations, and comprehensive activities.
            </p>
          </motion.div>
        </div>

        {/* The Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {classes.map((cls) => {
            const count = chapters.filter(c => c.classLevel === cls).length;
            return (
              <motion.button
                key={cls}
                variants={itemVariants}
                onClick={() => setSelectedClass(cls)}
                className="group relative flex flex-col justify-between p-8 h-48 w-full bg-white border border-zinc-200 hover:border-indigo-500/30 hover:bg-white/80 shadow-sm hover:shadow-md dark:bg-zinc-900/20 dark:border-white/5 dark:hover:bg-zinc-900/40 dark:shadow-none rounded-2xl text-left transition-all duration-300 overflow-hidden"
              >
                {/* Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 via-indigo-50/0 to-indigo-50/0 group-hover:to-indigo-50/50 dark:from-indigo-500/0 dark:via-indigo-500/0 dark:to-indigo-500/0 dark:group-hover:to-indigo-500/5 transition-all duration-500" />

                <div className="flex items-start justify-between w-full relative z-10">
                    <span className="px-2 py-1 rounded-md bg-zinc-100 text-[10px] font-mono text-zinc-500 uppercase tracking-widest border border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-white/5">
                      Grade
                    </span>
                    {count > 0 ? (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100/50 border border-emerald-200/50 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                           <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                           <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">{count} Units</span>
                        </div>
                    ) : (
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-600">Empty</span>
                    )}
                </div>

                <div className="relative z-10">
                  <h2 className="text-5xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tighter group-hover:translate-x-1 transition-transform duration-300">
                    {cls}
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2 font-medium flex items-center gap-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    View Materials <ChevronRight size={14} />
                  </p>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </main>

      {/* --- Footer --- */}
      <footer className="border-t border-zinc-200 dark:border-white/5 py-8 mt-12 transition-colors">
        <div className="max-w-6xl mx-auto px-6 text-center text-zinc-500 dark:text-zinc-600 text-xs">
          <p>© {new Date().getFullYear()} EnglishMastery Platform. Designed for performance.</p>
        </div>
      </footer>

      {/* --- Modal Overlay --- */}
      <AnimatePresence>
        {selectedClass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">

            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/60 dark:bg-black/80 backdrop-blur-sm transition-colors"
              onClick={() => setSelectedClass(null)}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl dark:shadow-none flex flex-col max-h-[85vh] overflow-hidden transition-colors"
            >

              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-900 bg-white dark:bg-[#0a0a0a] transition-colors">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold text-lg">
                      {selectedClass}
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">Class {selectedClass}</h3>
                      <p className="text-xs text-zinc-500">Select a chapter to begin reading</p>
                   </div>
                </div>
                <button
                  onClick={() => setSelectedClass(null)}
                  className="p-2 text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-3">
                    <Loader2 className="animate-spin w-6 h-6 text-indigo-500" />
                    <span className="text-xs uppercase tracking-widest">Loading Content</span>
                  </div>
                ) : classChapters.length > 0 ? (
                  <div className="space-y-2">
                    {classChapters.map((chapter, i) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={chapter._id}
                      >
                        <Link
                          href={`/chapter/${chapter._id}`}
                          className="group flex items-center justify-between p-4 rounded-xl bg-zinc-50 hover:bg-white border border-transparent hover:border-zinc-200 hover:shadow-sm dark:bg-zinc-900/30 dark:hover:bg-zinc-900 dark:hover:border-zinc-800 dark:hover:shadow-none transition-all duration-200"
                        >
                          <div className="flex items-center gap-5">
                            <span className="flex-shrink-0 w-12 text-right font-mono text-sm text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              #{chapter.chapterNumber}
                            </span>
                            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700 transition-colors"></div>
                            <div className="flex flex-col">
                              <h4 className="text-base font-medium text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white leading-snug">
                                {chapter.title}
                              </h4>
                              {chapter.author && (
                                  <span className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5 flex items-center gap-1">
                                      <span className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600"></span>
                                      {chapter.author}
                                  </span>
                              )}
                            </div>
                          </div>
                          <div className="p-2 rounded-full text-zinc-400 dark:text-zinc-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-all">
                              <ChevronRight size={16} />
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 px-6">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-200 dark:border-zinc-800">
                        <Sparkles className="w-6 h-6 text-zinc-400 dark:text-zinc-600" />
                    </div>
                    <h4 className="text-zinc-600 dark:text-zinc-300 font-medium">No chapters yet</h4>
                    <p className="text-zinc-500 text-sm mt-1 max-w-xs mx-auto">
                      Content for Class {selectedClass} hasn't been uploaded. Check the admin panel to add new units.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900 text-center transition-colors">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-600 uppercase tracking-widest">
                    {classChapters.length} Total Documents
                  </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
