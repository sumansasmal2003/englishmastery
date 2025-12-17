"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, X, ChevronRight, Command, PenTool, ArrowRight, Search, FileText
} from "lucide-react";

// --- Animations ---
const containerVariants = { show: { transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

// --- SKELETON COMPONENTS ---
const SkeletonClassCard = () => (
  <div className="relative flex flex-col justify-between p-8 h-48 w-full bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
    <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800/50 animate-pulse" />
    <div className="relative z-10 flex justify-between w-full">
      <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-700 rounded-md animate-pulse"></div>
      <div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-700 rounded-full animate-pulse"></div>
    </div>
    <div className="relative z-10 space-y-3">
      <div className="h-10 w-24 bg-zinc-300 dark:bg-zinc-600 rounded-lg animate-pulse"></div>
      <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
    </div>
  </div>
);

const SkeletonGrammarCard = () => (
  <div className="h-full p-6 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl">
    <div className="flex justify-between mb-4">
      <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
      <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-5 w-3/4 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse"></div>
      <div className="h-3 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
    </div>
    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
      <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
    </div>
  </div>
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

  // --- Filtering Logic (Search) ---
  const filteredChapters = chapters.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGrammar = grammar.filter(g =>
    g.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Filtering Logic (Class Modal) ---
  // THIS WAS MISSING IN PREVIOUS CODE causing the ReferenceError
  const classChapters = chapters.filter((ch) => ch.classLevel === selectedClass);

  const isSearching = searchQuery.length > 0;
  const classes = [5, 6, 7, 8, 9, 10];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans selection:bg-indigo-500/30 transition-colors">

      {/* --- Header --- */}
      <header className="fixed top-0 inset-x-0 z-40 border-b border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-lg flex items-center justify-center shadow-lg">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="font-semibold text-sm tracking-wide hidden sm:inline-block">EnglishMastery</span>
          </div>
          <Link href="/add-chapter" className="group flex items-center gap-2 px-4 py-2 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 dark:border-zinc-800 rounded-full transition-all">
            <Command size={13} className="text-zinc-400 group-hover:text-indigo-500 transition-colors" />
            <span>Admin Panel</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20 space-y-12">

        {/* --- Search Bar --- */}
        <div className="relative max-w-2xl mx-auto mb-16">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-zinc-400" />
            </div>
            <input
                type="text"
                placeholder="Search for chapters, authors, or grammar topics..."
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isSearching && (
                <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-4 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                    <X size={16} />
                </button>
            )}
        </div>

        {/* --- LOADING SKELETON STATE --- */}
        {loading ? (
            <div className="space-y-24 animate-in fade-in duration-500">
                {/* Academic Skeleton */}
                <section>
                    <div className="mb-8 flex items-end gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                        <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonClassCard key={i} />)}
                    </div>
                </section>

                {/* Grammar Skeleton */}
                <section>
                    <div className="mb-8 flex items-end gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                        <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => <SkeletonGrammarCard key={i} />)}
                    </div>
                </section>
            </div>
        ) : (
            /* --- REAL CONTENT --- */
            <>
                {isSearching ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                        {/* Search Results */}
                        <section>
                            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <FileText size={16}/> Found Chapters ({filteredChapters.length})
                            </h2>
                            {filteredChapters.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredChapters.map(ch => (
                                        <Link key={ch._id} href={`/chapter/${ch._id}`} className="block group">
                                            <div className="p-5 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-indigo-500/30 transition-all h-full">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded">Class {ch.classLevel}</span>
                                                    <span className="text-xs text-zinc-400 font-mono">Ch {ch.chapterNumber}</span>
                                                </div>
                                                <h3 className="font-bold text-lg mb-1 group-hover:text-indigo-500 transition-colors">{ch.title}</h3>
                                                <p className="text-xs text-zinc-500">{ch.author || "Unknown Author"}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-zinc-500 text-sm italic">No chapters matching "{searchQuery}"</p>
                            )}
                        </section>

                        <section>
                            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <PenTool size={16}/> Found Grammar Topics ({filteredGrammar.length})
                            </h2>
                            {filteredGrammar.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredGrammar.map(gr => (
                                        <Link key={gr._id} href={`/grammar/${gr._id}`} className="block group">
                                            <div className="p-5 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-emerald-500/30 transition-all h-full">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded">Grammar</span>
                                                </div>
                                                <h3 className="font-bold text-lg mb-1 group-hover:text-emerald-500 transition-colors">{gr.topic}</h3>
                                                <p className="text-xs text-zinc-500 line-clamp-1">{gr.description}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-zinc-500 text-sm italic">No grammar topics matching "{searchQuery}"</p>
                            )}
                        </section>
                    </motion.div>
                ) : (
                    /* Default Dashboard View */
                    <>
                        <section>
                            <div className="mb-8 flex items-end gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Academic Curriculum</h2>
                                <p className="text-sm text-zinc-500 pb-1 hidden sm:block">Select your grade level</p>
                            </div>

                            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {classes.map((cls) => {
                                const count = chapters.filter(c => c.classLevel === cls).length;
                                return (
                                <motion.button
                                    key={cls}
                                    variants={itemVariants}
                                    onClick={() => setSelectedClass(cls)}
                                    className="group relative flex flex-col justify-between p-8 h-48 w-full bg-white dark:bg-zinc-900/20 border border-zinc-200 dark:border-white/5 hover:border-indigo-500/30 rounded-2xl text-left transition-all duration-300 overflow-hidden shadow-sm dark:shadow-none hover:shadow-md"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/0 group-hover:to-indigo-500/5 transition-all duration-500" />
                                    <div className="flex items-start justify-between w-full relative z-10">
                                        <span className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/50 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Grade</span>
                                        {count > 0 ? (
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                                                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse"></span>
                                                <span className="text-[10px] font-medium">{count} Units</span>
                                            </div>
                                        ) : <span className="text-[10px] text-zinc-400">Empty</span>}
                                    </div>
                                    <div className="relative z-10">
                                        <h2 className="text-5xl font-bold text-zinc-900 dark:text-white tracking-tighter group-hover:translate-x-1 transition-transform">{cls}</h2>
                                        <p className="text-sm text-zinc-500 mt-2 font-medium flex items-center gap-1 group-hover:text-indigo-500 transition-colors">
                                            View Materials <ChevronRight size={14} />
                                        </p>
                                    </div>
                                </motion.button>
                                );
                            })}
                            </motion.div>
                        </section>

                        <section>
                            <div className="mb-8 flex items-end gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Grammar Reference</h2>
                                <p className="text-sm text-zinc-500 pb-1 hidden sm:block">Master the rules</p>
                            </div>

                            {grammar.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {grammar.map((topic) => (
                                        <Link key={topic._id} href={`/grammar/${topic._id}`} className="group block h-full">
                                            <motion.div
                                                whileHover={{ y: -4 }}
                                                className="h-full p-6 bg-white dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-emerald-500/30 transition-all shadow-sm dark:shadow-none hover:shadow-lg"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                                                        <PenTool size={20} />
                                                    </div>
                                                    <ArrowRight size={16} className="text-zinc-300 group-hover:text-emerald-500 -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all" />
                                                </div>
                                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{topic.topic}</h3>
                                                <p className="text-xs text-zinc-500 line-clamp-2">{topic.description || "Learn the fundamental rules and usage."}</p>
                                                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center gap-2 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                                                    <span>{topic.sections.length} Rules</span>
                                                </div>
                                            </motion.div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                                    <p className="text-zinc-500">No grammar topics added yet.</p>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </>
        )}

      </main>

      {/* --- Class Modal --- */}
      <AnimatePresence>
        {selectedClass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/60 dark:bg-black/80 backdrop-blur-sm" onClick={() => setSelectedClass(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-900">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold text-lg">{selectedClass}</div>
                   <div><h3 className="text-lg font-bold text-zinc-900 dark:text-white">Class {selectedClass}</h3><p className="text-xs text-zinc-500">Select a chapter</p></div>
                </div>
                <button onClick={() => setSelectedClass(null)} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {classChapters.length > 0 ? (
                  <div className="space-y-2">
                    {classChapters.map((chapter, i) => (
                      <Link key={chapter._id} href={`/chapter/${chapter._id}`} className="group flex items-center justify-between p-4 rounded-xl bg-zinc-50 hover:bg-white dark:bg-zinc-900/30 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all">
                          <div className="flex items-center gap-5">
                            <span className="font-mono text-sm text-zinc-400 group-hover:text-indigo-500">#{chapter.chapterNumber}</span>
                            <div>
                              <h4 className="text-base font-medium text-zinc-700 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white">{chapter.title}</h4>
                              {chapter.author && <span className="text-xs text-zinc-500">{chapter.author}</span>}
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-zinc-400 group-hover:text-indigo-500"/>
                      </Link>
                    ))}
                  </div>
                ) : <div className="text-center py-20 text-zinc-500">No chapters found for Class {selectedClass}.</div>}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
