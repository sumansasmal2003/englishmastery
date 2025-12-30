"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, X, ChevronRight, Command, PenTool, ArrowRight, Search, FileText, Sparkles, GraduationCap,
  Image as ImageIcon, Gamepad2, Trophy, Feather, Filter
} from "lucide-react";

// --- Animations ---
const containerVariants = { show: { transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

// --- "SUBTLE GRAPH" BORDER ---
const GraphBorder = ({ side = "left" }) => {
  const isLeft = side === "left";
  const containerClass = isLeft ? "left-0" : "right-0";

  return (
    <div className={`fixed ${containerClass} top-0 bottom-0 w-16 z-20 hidden xl:flex flex-col items-center bg-white/50 dark:bg-black/50 backdrop-blur-[2px] border-${side === 'left' ? 'r' : 'l'} border-zinc-200 dark:border-zinc-800`}>
      <div className={`absolute top-0 bottom-0 ${isLeft ? "right-1" : "left-1"} w-px bg-zinc-200 dark:bg-zinc-800`}></div>
      <div className="absolute inset-0 w-full h-full opacity-40 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>
    </div>
  );
};

// --- SMOOTH IMAGE LOADER ---
const SmoothImage = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className} bg-zinc-100 dark:bg-zinc-800`}>
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-zinc-200 dark:bg-zinc-700 z-0" />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${
          isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-md"
        }`}
      />
    </div>
  );
};

export default function HomeDashboard({ chapters = [], grammar = [], writings = [], classInfos = [] }) {
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // New State for Writing Filter
  const [writingFilter, setWritingFilter] = useState("ALL");

  // --- Search Logic ---
  const filteredChapters = chapters.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGrammar = grammar.filter(g =>
    g.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWritings = writings.filter(w =>
    w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.question?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const classChapters = chapters.filter((ch) => ch.classLevel === selectedClass);
  const isSearching = searchQuery.length > 0;

  // --- Writing Category Logic ---
  // Get unique types from the writings array
  const writingTypes = useMemo(() => {
      const types = new Set(writings.map(w => w.type));
      return ["ALL", ...Array.from(types).sort()];
  }, [writings]);

  const displayedWritings = writingFilter === "ALL"
      ? writings
      : writings.filter(w => w.type === writingFilter);


  // Classes List
  const classes = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const getClassImage = (cls) => {
    const info = classInfos.find(i => i.classLevel === cls);
    return info?.coverImage || null;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans selection:bg-white selection:text-black relative overflow-x-hidden">

      {/* --- BACKGROUND DESIGN --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
         <div className="absolute inset-0 opacity-20 dark:opacity-20" style={{
             backgroundImage: 'radial-gradient(#888 1px, transparent 1px)',
             backgroundSize: '40px 40px'
         }}></div>
         <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-50 animate-pulse-slow" />
         <div className="absolute bottom-[-20%] right-[20%] w-[600px] h-[600px] bg-violet-500/10 dark:bg-violet-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-50" />
      </div>

      <GraphBorder side="left" />
      <GraphBorder side="right" />

      {/* --- Header --- */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-md flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
              <BookOpen size={16} className="text-white dark:text-black" />
            </div>
            <span className="font-bold text-lg tracking-tight text-black dark:text-white">EnglishMastery</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/arcade" className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 dark:border-indigo-800 rounded text-indigo-600 dark:text-indigo-400 transition-all">
                <Gamepad2 size={14} />
                <span>Arcade</span>
            </Link>

            <Link href="/add-chapter" className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 dark:bg-[#111] dark:hover:bg-[#222] dark:border-zinc-800 rounded text-zinc-600 dark:text-zinc-400 transition-all">
                <Command size={12} />
                <span>Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-24">

        {/* --- Hero / Search --- */}
        <div className="max-w-2xl mx-auto text-center mb-24 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter text-black dark:text-white mb-6">
              Master the <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-800 to-zinc-400 dark:from-white dark:to-zinc-500">Written Word.</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-md mx-auto leading-relaxed">
              A comprehensive learning platform for literature analysis, grammar excellence, and writing skills.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="relative group max-w-md mx-auto"
          >
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="Search chapters, writings, or grammar..."
              className="w-full pl-12 pr-10 py-3 bg-zinc-50 dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm focus:ring-1 focus:ring-white focus:border-white outline-none transition-all text-sm placeholder:text-zinc-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isSearching && (
              <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-4 flex items-center text-zinc-400 hover:text-black dark:hover:text-white">
                <X size={16} />
              </button>
            )}
          </motion.div>
        </div>

        {/* --- CONTENT AREA --- */}
        {isSearching ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">

                {/* 1. Search Literature */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">
                        <FileText size={12}/> Literature Results
                    </div>
                    {filteredChapters.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredChapters.map(ch => (
                                <Link key={ch._id} href={`/chapter/${ch._id}`} className="group relative p-5 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="px-2 py-0.5 bg-zinc-100 dark:bg-[#222] text-[10px] font-mono border border-zinc-200 dark:border-zinc-700 rounded text-zinc-500">Class {ch.classLevel}</span>
                                        <ArrowRight size={14} className="text-zinc-800 dark:text-zinc-200 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all"/>
                                    </div>
                                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">{ch.title}</h3>
                                    <p className="text-xs text-zinc-500 font-medium">{ch.author || "Unknown Author"}</p>
                                </Link>
                            ))}
                        </div>
                    ) : <div className="text-zinc-500 text-sm italic pl-1">No chapters found matching your query.</div>}
                </div>

                {/* 2. Search Writing */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">
                        <Feather size={12}/> Writing Results
                    </div>
                    {filteredWritings.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredWritings.map(w => (
                                <Link key={w._id} href={`/writing/${w._id}`} className="group p-5 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-wider">{w.type.replace(/_/g, ' ')}</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-1">{w.title}</h3>
                                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{w.question}</p>
                                </Link>
                            ))}
                        </div>
                    ) : <div className="text-zinc-500 text-sm italic pl-1">No writing tasks found.</div>}
                </div>

                {/* 3. Search Grammar */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">
                        <PenTool size={12}/> Grammar Results
                    </div>
                    {filteredGrammar.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredGrammar.map(gr => (
                                <Link key={gr._id} href={`/grammar/${gr._id}`} className="group p-5 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white"/>
                                        <span className="text-xs font-bold text-zinc-500 uppercase">Grammar</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">{gr.topic}</h3>
                                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{gr.description}</p>
                                </Link>
                            ))}
                        </div>
                    ) : <div className="text-zinc-500 text-sm italic pl-1">No grammar topics found.</div>}
                </div>
            </motion.div>
        ) : (
            /* --- DEFAULT DASHBOARD --- */
            <div className="space-y-24">

                {/* 1. ACADEMIC SECTION */}
                <section>
                    <div className="flex items-end justify-between mb-6 px-1 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                        <div className="flex items-center gap-3">
                            <GraduationCap className="text-zinc-800 dark:text-zinc-200" size={20} />
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Academic Curriculum</h2>
                        </div>
                    </div>

                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classes.map((cls) => {
                            const count = chapters.filter(c => c.classLevel === cls).length;
                            const coverImg = getClassImage(cls);

                            return (
                                <motion.button
                                    key={cls}
                                    variants={itemVariants}
                                    onClick={() => setSelectedClass(cls)}
                                    className="group relative flex flex-col justify-between h-48 w-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-lg text-left transition-all duration-200 overflow-hidden shadow-sm hover:shadow-lg"
                                >
                                    {coverImg ? (
                                        <>
                                            <div className="absolute inset-0 z-0">
                                                <SmoothImage src={coverImg} alt={`Class ${cls}`} className="w-full h-full" />
                                            </div>
                                            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
                                        </>
                                    ) : (
                                        <div className="absolute -bottom-6 -right-6 text-[10rem] font-black text-zinc-50 dark:text-[#111] leading-none select-none transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12 z-0">
                                            {cls}
                                        </div>
                                    )}

                                    <div className="relative z-20 flex justify-between w-full p-6 pb-0">
                                        <div className={`px-2 py-0.5 rounded text-[10px] font-mono border ${coverImg ? 'bg-black/50 border-white/20 text-white' : 'bg-zinc-100 dark:bg-[#111] border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'}`}>
                                            {count} Units
                                        </div>
                                    </div>

                                    <div className="relative z-20 mt-auto p-6 pt-0">
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-4xl font-bold tracking-tighter transition-colors ${coverImg ? 'text-white' : 'text-zinc-900 dark:text-white group-hover:text-black dark:group-hover:text-white'}`}>{cls}</span>
                                            <span className={`text-sm font-medium ${coverImg ? 'text-zinc-300' : 'text-zinc-400'}`}>th</span>
                                        </div>
                                        <div className={`flex items-center gap-1.5 mt-2 text-xs font-medium transition-colors ${coverImg ? 'text-zinc-300 group-hover:text-white' : 'text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300'}`}>
                                            View Syllabus <ChevronRight size={10} strokeWidth={3} />
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                </section>

                {/* 2. WRITING STUDIO SECTION (NEW) */}
                <section>
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 px-1 border-b border-zinc-100 dark:border-zinc-900 pb-4 gap-4">
                        <div className="flex items-center gap-3">
                            <Feather className="text-zinc-800 dark:text-zinc-200" size={20} />
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Writing Studio</h2>
                                <p className="text-xs text-zinc-500 font-medium mt-1">Latest assignments and tasks</p>
                            </div>
                        </div>

                        {/* Link to Full Library */}
                        <Link href="/writings" className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:gap-3 transition-all">
                            View Full Library <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {writings.length > 0 ? writings.map((item) => (
                            <Link key={item._id} href={`/writing/${item._id}`} className="group relative bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 hover:border-rose-300 dark:hover:border-rose-900 transition-all duration-300 shadow-sm hover:shadow-md">
                                <div className="absolute top-4 right-4">
                                    <ArrowRight size={16} className="text-zinc-300 group-hover:text-rose-500 -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all"/>
                                </div>
                                <div className="mb-4">
                                    <span className="inline-block px-2 py-1 rounded bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 text-[9px] font-bold tracking-widest uppercase border border-rose-100 dark:border-rose-900/20">
                                        {item.type.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2 leading-tight group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                                    {item.question}
                                </p>
                            </Link>
                        )) : (
                            <div className="col-span-full py-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                                <p className="text-sm text-zinc-400">No writing tasks available.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 3. GRAMMAR SECTION */}
                <section>
                    <div className="flex items-center gap-3 mb-6 px-1 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                        <Sparkles className="text-zinc-800 dark:text-zinc-200" size={20} />
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Grammar Reference</h2>
                        </div>
                    </div>

                    {grammar.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {grammar.map((topic) => (
                                <Link key={topic._id} href={`/grammar/${topic._id}`} className="group block h-full">
                                    <motion.div whileHover={{ y: -2 }} className="h-full p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-[#111] flex items-center justify-center text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                                <PenTool size={14} />
                                            </div>
                                            <ArrowRight size={16} className="text-zinc-400 dark:text-zinc-500 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">{topic.topic}</h3>
                                            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{topic.description || "Essential rules and examples."}</p>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-center">
                            <p className="text-sm text-zinc-400">No grammar topics available yet.</p>
                        </div>
                    )}
                </section>

                {/* 4. PRACTICE ZONE */}
                <section>
                    <div className="flex items-center gap-3 mb-6 px-1 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                        <Trophy className="text-zinc-800 dark:text-zinc-200" size={20} />
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Practice Zone</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <Link href="/arcade" className="group relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] p-8 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all">
                              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                  <Gamepad2 size={120} />
                              </div>
                              <div className="relative z-10">
                                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mb-4">
                                      <Gamepad2 size={20} />
                                  </div>
                                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">English Arcade</h3>
                                  <p className="text-sm text-zinc-500 max-w-sm mb-6">Challenge yourself with interactive quizzes and games designed to test your vocabulary and grammar skills.</p>
                                  <span className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 group-hover:gap-3 transition-all">
                                      Enter Arcade <ArrowRight size={16} />
                                  </span>
                              </div>
                         </Link>
                    </div>
                </section>

            </div>
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
                className="absolute inset-0 bg-white/80 dark:bg-black/90 backdrop-blur-sm"
                onClick={() => setSelectedClass(null)}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="relative w-full max-w-2xl bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
            >
              <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center shadow-lg">
                        <span className="text-xl font-bold text-white dark:text-black tracking-tighter">{selectedClass}</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">Class {selectedClass} Curriculum</h3>
                        <p className="text-sm text-zinc-500 mt-0.5">Select a unit to start learning</p>
                    </div>
                </div>
                <button onClick={() => setSelectedClass(null)} className="p-2 bg-zinc-100 dark:bg-[#111] rounded-md text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
                    <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-zinc-50/50 dark:bg-black custom-scrollbar">
                {classChapters.length > 0 ? (
                  <div className="space-y-2">
                    {classChapters.map((chapter) => (
                      <Link key={chapter._id} href={`/chapter/${chapter._id}`} className="group flex items-center justify-between p-5 rounded-lg bg-white dark:bg-[#0f0f0f] border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all">
                          <div className="flex items-center gap-5">
                            <span className="font-mono text-xs font-bold text-zinc-500 bg-zinc-50 dark:bg-[#1a1a1a] px-3 py-1.5 rounded border border-zinc-200 dark:border-zinc-700">#{chapter.chapterNumber}</span>
                            <div>
                              <h4 className="text-base font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white transition-colors">{chapter.title}</h4>
                              {chapter.author && <span className="text-xs text-zinc-500 font-medium">{chapter.author}</span>}
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-50 dark:bg-[#1a1a1a] group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-all">
                             <ChevronRight size={16} />
                          </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                        <BookOpen size={40} className="mb-4 opacity-20"/>
                        <p className="text-sm font-medium">No syllabus content available yet.</p>
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
