"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, X, ChevronRight, Command, PenTool, ArrowRight, Search, FileText, Sparkles, GraduationCap
} from "lucide-react";

// --- Animations ---
const containerVariants = { show: { transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

// --- SKELETONS ---
const SkeletonCard = () => (
  <div className="h-40 w-full bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-pulse" />
);

export default function Home() {
  const [chapters, setChapters] = useState([]);
  const [grammar, setGrammar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [chapRes, gramRes] = await Promise.all([
            fetch("/api/chapters"),
            fetch("/api/grammar")
        ]);
        const chapData = await chapRes.json();
        const gramData = await gramRes.json();

        if (chapData.success) setChapters(chapData.data);
        if (gramData.success) setGrammar(gramData.data);
      } catch (error) {
        console.error("Fetch failed", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredChapters = chapters.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGrammar = grammar.filter(g =>
    g.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const classChapters = chapters.filter((ch) => ch.classLevel === selectedClass);
  const isSearching = searchQuery.length > 0;
  const classes = [5, 6, 7, 8, 9, 10];

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-zinc-900 dark:text-zinc-200 font-sans selection:bg-indigo-500/20 relative">

      {/* --- BACKGROUND GRID --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        {/* Radial Vignette to soften edges */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#ffffff00,white)] dark:bg-[radial-gradient(circle_800px_at_50%_200px,#00000000,#050505)]"></div>
      </div>

      {/* --- Header --- */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-zinc-200/50 dark:border-white/5 bg-white/60 dark:bg-black/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-default">
            <div className="w-7 h-7 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <BookOpen size={14} className="text-white dark:text-black" />
            </div>
            <span className="font-bold text-sm tracking-tight text-zinc-800 dark:text-zinc-100">EnglishMastery</span>
          </div>
          <Link href="/add-chapter" className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 rounded-md transition-colors text-zinc-600 dark:text-zinc-400">
            <Command size={11} />
            <span>Admin</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-24">

        {/* --- Hero / Search --- */}
        <div className="max-w-2xl mx-auto text-center mb-16 space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Master the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Language.</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base max-w-md mx-auto">
            Comprehensive resources for literature and grammar excellence. Select your grade or search below.
          </p>

          <div className="relative group max-w-lg mx-auto">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search chapters or grammar..."
              className="w-full pl-11 pr-10 py-3 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm placeholder:text-zinc-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isSearching && (
              <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* --- CONTENT AREA --- */}
        {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
        ) : (
            <>
                {isSearching ? (
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                       {/* Search Results */}
                        <div className="space-y-6">
                           <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                               <FileText size={12}/> Literature Results
                           </div>
                           {filteredChapters.length > 0 ? (
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                   {filteredChapters.map(ch => (
                                       <Link key={ch._id} href={`/chapter/${ch._id}`} className="group relative p-5 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-indigo-500/50 transition-all duration-300">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-mono text-zinc-500">Class {ch.classLevel}</span>
                                                <ArrowRight size={14} className="text-zinc-300 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all"/>
                                            </div>
                                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{ch.title}</h3>
                                            <p className="text-xs text-zinc-500 mt-1">{ch.author || "Unknown"}</p>
                                       </Link>
                                   ))}
                               </div>
                           ) : <div className="text-zinc-500 text-sm italic">No chapters found.</div>}
                        </div>

                        <div className="space-y-6">
                           <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                               <PenTool size={12}/> Grammar Results
                           </div>
                           {filteredGrammar.length > 0 ? (
                               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                   {filteredGrammar.map(gr => (
                                       <Link key={gr._id} href={`/grammar/${gr._id}`} className="group p-5 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-emerald-500/50 transition-all duration-300">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
                                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Grammar</span>
                                            </div>
                                            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{gr.topic}</h3>
                                            <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{gr.description}</p>
                                       </Link>
                                   ))}
                               </div>
                           ) : <div className="text-zinc-500 text-sm italic">No grammar topics found.</div>}
                        </div>
                   </motion.div>
                ) : (
                    /* --- DEFAULT DASHBOARD --- */
                    <div className="space-y-20">

                        {/* 1. ACADEMIC SECTION */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <GraduationCap className="text-indigo-500" size={20} />
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Academic Curriculum</h2>
                            </div>

                            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {classes.map((cls) => {
                                    const count = chapters.filter(c => c.classLevel === cls).length;
                                    return (
                                        <motion.button
                                            key={cls}
                                            variants={itemVariants}
                                            onClick={() => setSelectedClass(cls)}
                                            className="group relative flex flex-col justify-between h-40 p-6 w-full bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/80 hover:border-indigo-500/30 rounded-2xl text-left transition-all duration-300 overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                                            <div className="relative z-10 flex justify-between w-full">
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Grade</span>
                                                <div className="px-2 py-1 rounded-md bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/50 text-[10px] text-zinc-500 font-mono">
                                                    {count} Units
                                                </div>
                                            </div>

                                            <div className="relative z-10">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tighter group-hover:text-indigo-500 transition-colors">{cls}</span>
                                                    <span className="text-sm text-zinc-400 font-medium">th</span>
                                                </div>
                                                <div className="flex items-center gap-1 mt-1 text-xs text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    View Syllabus <ChevronRight size={12} />
                                                </div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </motion.div>
                        </section>

                        {/* 2. GRAMMAR SECTION */}
                        <section>
                             <div className="flex items-center gap-3 mb-6">
                                <Sparkles className="text-emerald-500" size={20} />
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Grammar Reference</h2>
                            </div>

                            {grammar.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {grammar.map((topic) => (
                                        <Link key={topic._id} href={`/grammar/${topic._id}`} className="group block h-full">
                                            <motion.div whileHover={{ y: -2 }} className="h-full p-5 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/80 rounded-xl hover:border-emerald-500/30 transition-all">
                                                <div className="flex items-start justify-between mb-8">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                        <PenTool size={14} />
                                                    </div>
                                                    <ArrowRight size={14} className="text-zinc-300 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">{topic.topic}</h3>
                                                    <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">{topic.description || "Essential rules and examples."}</p>
                                                </div>
                                            </motion.div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center text-xs text-zinc-500">
                                    No grammar topics available.
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </>
        )}
      </main>

      {/* --- Stylish Class Modal --- */}
      <AnimatePresence>
        {selectedClass && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm"
                onClick={() => setSelectedClass(null)}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="relative w-full max-w-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                        <span className="text-xl font-bold text-zinc-900 dark:text-white tracking-tighter">{selectedClass}</span>
                   </div>
                   <div>
                       <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">Class {selectedClass} Curriculum</h3>
                       <p className="text-xs text-zinc-500 mt-0.5">Select a unit to start learning</p>
                   </div>
                </div>
                <button onClick={() => setSelectedClass(null)} className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 bg-zinc-50/50 dark:bg-black/20 custom-scrollbar">
                {classChapters.length > 0 ? (
                  <div className="space-y-1 p-2">
                    {classChapters.map((chapter) => (
                      <Link key={chapter._id} href={`/chapter/${chapter._id}`} className="group flex items-center justify-between p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50 hover:border-indigo-500/30 hover:shadow-sm transition-all">
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-950 px-2 py-1 rounded">Ch.{chapter.chapterNumber}</span>
                            <div>
                              <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{chapter.title}</h4>
                              {chapter.author && <span className="text-[10px] text-zinc-400">{chapter.author}</span>}
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 text-zinc-400 group-hover:text-indigo-500 transition-colors">
                             <ChevronRight size={14} />
                          </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-zinc-400">
                        <BookOpen size={32} className="mb-3 opacity-20"/>
                        <p className="text-sm">No chapters uploaded for Class {selectedClass} yet.</p>
                    </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
