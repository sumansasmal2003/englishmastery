"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Loader2, Layers, CheckCircle2, Download,
  Eye, EyeOff, ListChecks, SplitSquareHorizontal, HelpCircle, FileText, ChevronDown, ArrowDownUp, Type, BoxSelect, Highlighter, Table2, Feather, Network, Heart, ArrowRightLeft,
  Lightbulb, Grid3X3,
  Users,
  MapPin,
  ExternalLink,
  Book,
  Volume2,
  X,
  Languages,
  Zap,
  RotateCw,
  ChevronRight,
  ChevronLeft,
  ImageIcon,
  Calendar,
  UserCircle2
} from "lucide-react";
import ChapterChatbot from "@/components/ChapterChatbot";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 40, damping: 20 } },
};

// --- "SUBTLE GRAPH" BORDER (Vercel Style) ---
const GraphBorder = ({ side = "left" }) => {
  const isLeft = side === "left";
  const containerClass = isLeft ? "left-0" : "right-0";

  return (
    <div className={`fixed ${containerClass} top-0 bottom-0 w-16 z-20 hidden xl:flex flex-col items-center bg-white/50 dark:bg-black/50 backdrop-blur-[2px] border-${side === 'left' ? 'r' : 'l'} border-zinc-200 dark:border-zinc-800`}>
      <div className={`absolute top-0 bottom-0 ${isLeft ? "right-1" : "left-1"} w-px bg-zinc-200 dark:bg-zinc-800`}></div>
      <div className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>
    </div>
  );
};

// --- PROFESSIONAL IMAGE COMPONENT ---
const ProfessionalImage = ({ src, alt, className, priority = false }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {/* Skeleton / Loading State */}
      {isLoading && (
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 animate-pulse">
            <ImageIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-700 opacity-50" />
        </div>
      )}

      {/* Actual Image */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setIsLoading(false)}
        className={`${className} ${
          isLoading ? 'opacity-0 scale-105 blur-lg' : 'opacity-100 scale-100 blur-0'
        } transition-all duration-700 ease-in-out`}
      />
    </>
  );
};

export default function ChapterDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [chapter, setChapter] = useState(null);
  const [grammarList, setGrammarList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Toggle States
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [expandedActivities, setExpandedActivities] = useState({});

  // --- DICTIONARY STATE ---
  const [selectedWord, setSelectedWord] = useState(null);

  // --- FLASHCARD STATE ---
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [flashcardDeck, setFlashcardDeck] = useState([]);

  const pdfRef = useRef();

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      try {
        setLoading(true);
        const [chapterRes, grammarRes] = await Promise.all([
            fetch(`/api/chapters/${id}`),
            fetch('/api/grammar')
        ]);

        const chapterData = await chapterRes.json();
        const grammarData = await grammarRes.json();

        if (chapterData.success) {
            const data = chapterData.data;
            setChapter(data);
            generateFlashcards(data);

            // --- DYNAMIC TITLE UPDATE ---
            // Format: "Title [- Author] | Class X"
            let titleStr = data.title;
            // Only append author if it exists and is not "N/A" (case-insensitive check)
            if (data.author && data.author.trim().toUpperCase() !== 'N/A') {
                titleStr += ` - ${data.author}`;
            }
            titleStr += ` | Class ${data.classLevel}`;
            document.title = titleStr;
            // ----------------------------
        }
        if (grammarData.success) setGrammarList(grammarData.data || []);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // --- FLASHCARD GENERATOR LOGIC ---
  const generateFlashcards = (chapData) => {
      const words = new Set();
      chapData.units?.forEach(u => {
          u.activities?.forEach(a => {
              if(a.type === 'WORD_BOX' && a.questions?.[0]?.options) {
                  a.questions[0].options.forEach(w => words.add(w.trim()));
              }
          });
      });

      if(words.size < 5) {
          chapData.units?.forEach(u => {
              u.paragraphs?.forEach(p => {
                  const longWords = p.english.match(/\b[a-zA-Z]{7,}\b/g) || [];
                  longWords.forEach(w => words.add(w.toLowerCase().replace(/^\w/, c => c.toUpperCase())));
              });
          });
      }

      const deck = Array.from(words).map(w => ({ word: w, def: null }));
      setFlashcardDeck(deck);
  };

  const toggleReveal = (uid, aid) => {
    const key = `${uid}-${aid}`;
    setRevealedAnswers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleActivitySection = (uIndex) => {
      setExpandedActivities(prev => ({ ...prev, [uIndex]: !prev[uIndex] }));
  };

  // --- DICTIONARY HANDLER ---
  const handleWordClick = async (rawWord) => {
      const word = rawWord.replace(/[^a-zA-Z]/g, "").toLowerCase();
      if (!word) return;
      setSelectedWord({ word, loading: true, data: null, error: null });
      try {
          const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
          if (!res.ok) throw new Error("Word not found");
          const data = await res.json();
          setSelectedWord({ word, loading: false, data: data[0], error: null });
      } catch (err) {
          setSelectedWord({ word, loading: false, data: null, error: "Definition not found." });
      }
  };

  // --- Auto-Linker Helper ---
  const findRelatedGrammar = (act) => {
    if (!grammarList.length) return null;
    const activityText = [act.instruction, ...(act.questions || []).map(q => q.text)].join(" ").toLowerCase();
    const cleanTopics = grammarList.map(g => {
        const cleanName = g.topic.replace(/[\(\[\{].*?[\)\]\}]/g, "").trim().toLowerCase();
        return { ...g, cleanName };
    });
    const match = cleanTopics
        .sort((a, b) => b.cleanName.length - a.cleanName.length)
        .find(g => g.cleanName.length > 2 && activityText.includes(g.cleanName));
    return match;
  };

  // --- Helpers for Text Parsing ---
  const cleanText = (text) => text?.replace(/[{}[\]]/g, "").replace(/\|(\d+)/g, "") || "";

  const renderDialogueScript = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
        const match = line.match(/^(.+?):\s*(.*)/);
        if (match) {
            return (
                <div key={i} className="flex gap-3 mb-3">
                    <div className="shrink-0 text-sm font-bold text-indigo-600 dark:text-indigo-400 min-w-[80px] text-right">{match[1]}</div>
                    <div className="text-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-[#111] px-3 py-1.5 rounded-lg rounded-tl-none border border-zinc-100 dark:border-zinc-800 shadow-sm">{match[2]}</div>
                </div>
            );
        }
        if (line.trim()) return <p key={i} className="text-xs text-zinc-400 italic mb-2 pl-24">{line}</p>;
        return null;
    });
  };

  const renderUnderlineAnswer = (text) => {
    if (!text) return null;
    const parts = text.split(/(\{.*?\})/g);
    return (
        <span className="leading-loose">
            {parts.map((part, i) => {
                if (part.startsWith('{') && part.endsWith('}')) {
                    return <span key={i} className="font-bold text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-500 mx-0.5 px-0.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-t">{part.slice(1, -1)}</span>;
                }
                return <span key={i}>{part}</span>;
            })}
        </span>
    );
  };

  const getChartParts = (text) => {
    if (!text) return { isInput: false, content: "" };
    const match = text.match(/\{(.+?)\}/);
    if (match) return { isInput: true, answer: match[1].trim() };
    return { isInput: false, content: text };
  };

  const renderUnderlineCircleAnswer = (text) => {
    if (!text) return null;
    const parts = text.split(/(\{.*?\}|\[.*?\])/g);
    return (
        <span className="leading-loose text-lg">
            {parts.map((part, i) => {
                if (part.startsWith('{') && part.endsWith('}')) return <span key={i} className="font-bold text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 mx-1">{part.slice(1, -1)}</span>;
                if (part.startsWith('[') && part.endsWith(']')) return <span key={i} className="font-bold text-orange-600 dark:text-orange-400 border-2 border-orange-500 rounded-full px-2 py-0.5 mx-1 inline-block">{part.slice(1, -1)}</span>;
                return <span key={i}>{part}</span>;
            })}
        </span>
    );
  };

  const getCategorizedWords = (text, columnIndex) => {
      if (!text) return [];
      const matches = text.match(/\{(.+?)\|(\d+)\}/g) || [];
      return matches.map(m => {
          const content = m.slice(1, -1);
          const [word, idx] = content.split('|');
          return parseInt(idx) === columnIndex ? word : null;
      }).filter(Boolean);
  };

  const handleDownloadPDF = async () => {
    if (!chapter) return;
    setDownloading(true);
    try {
        const html2pdf = (await import("html2pdf.js")).default;
        const element = pdfRef.current;
        const opt = {
          margin: [0.5, 0.5, 0.5, 0.5],
          filename: `${chapter.title.replace(/\s+/g, '_')}_TextOnly.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        await html2pdf().set(opt).from(element).save();
    } catch (err) {
        console.error("PDF Failed", err);
        alert("Could not generate PDF");
    } finally {
        setDownloading(false);
    }
  };

  if (loading) return <ChapterSkeleton />;
  if (!chapter) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Chapter not found.</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-zinc-900 dark:text-zinc-200 font-sans selection:bg-indigo-500/30 selection:text-white relative overflow-x-hidden">

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
      <header className="fixed top-0 inset-x-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-black/60 backdrop-blur-md overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                    <ArrowLeft size={18} className="text-zinc-500 dark:text-zinc-400" />
                </button>
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-bold">Class {chapter.classLevel}</span>
                    <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] sm:max-w-md">{chapter.title}</h1>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {flashcardDeck.length > 0 && (
                    <button onClick={() => setShowFlashcards(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-xs font-bold rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all">
                        <Zap size={14} className="fill-indigo-600 dark:fill-indigo-300"/>
                        <span className="hidden sm:inline">Flashcards</span>
                    </button>
                )}

                <button onClick={handleDownloadPDF} disabled={downloading} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded-full hover:opacity-90 transition-all disabled:opacity-50">
                    {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    <span className="hidden sm:inline">{downloading ? "Generating..." : "Download PDF"}</span>
                </button>
            </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20">

        {/* --- 1. CINEMATIC HERO SECTION --- */}
        <section className="mb-24">
            {chapter.coverImage ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-full h-[100vh] min-h-full rounded-[2rem] overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 group"
                >
                    {/* Professional Lazy Loaded Hero Image */}
                    <ProfessionalImage
                        src={chapter.coverImage}
                        alt={chapter.title}
                        priority={true} // Load eager for LCP
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] ease-linear group-hover:scale-110"
                    />

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>

                    {/* Content Positioned Bottom-Left */}
                    <div className="absolute bottom-0 left-0 p-8 md:p-14 w-full max-w-4xl space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap items-center gap-3"
                        >
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                                Chapter {chapter.chapterNumber}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                            <span className="text-zinc-300 text-xs font-medium uppercase tracking-wider">Literature</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] drop-shadow-lg"
                        >
                            {chapter.title}
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-6 pt-4 border-t border-white/20"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white">
                                    <UserCircle2 size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Author</p>
                                    <p className="text-sm font-medium text-white">{chapter.author || "Unknown"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Updated</p>
                                    <p className="text-sm font-medium text-white">{new Date(chapter.updatedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            ) : (
                // Standard Title Card (No Image)
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto py-12">
                    <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-full shadow-sm">
                        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 font-medium">Chapter {chapter.chapterNumber}</span>
                        {chapter.author && <><span className="text-zinc-300 dark:text-zinc-700">•</span><span className="text-zinc-600 dark:text-zinc-400 text-xs font-medium">{chapter.author}</span></>}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-[1.1]">{chapter.title}</h1>
                </motion.div>
            )}
        </section>

        {/* --- UNITS LOOP --- */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-32">
            {chapter.units.map((unit, uIndex) => (
                <motion.div key={uIndex} variants={itemVariants} className="relative">

                    {/* Unit Header */}
                    <div className="flex items-center gap-4 mb-12 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-zinc-900 border border-indigo-100 dark:border-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm">
                            <Layers size={24} />
                        </div>
                        <div>
                             <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Unit {uIndex + 1}</span>
                             <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mt-1 tracking-tight">{unit.title}</h2>
                        </div>
                    </div>

                    {/* 1. Paragraphs Section (INTERACTIVE) */}
                    <div className="space-y-16 mb-20">
                        {unit.paragraphs.map((para, pIndex) => (
                            <div key={pIndex} className="group relative bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 shadow-xl dark:shadow-2xl">

                                {/* --- PARAGRAPH IMAGE DISPLAY (PROFESSIONAL LOADER) --- */}
                                {para.image && (
                                    <div className="relative w-full h-64 md:h-96 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 overflow-hidden">

                                        {/* CHANGED to object-contain */}
                                        <ProfessionalImage
                                            src={para.image}
                                            alt={`Illustration for paragraph ${pIndex + 1}`}
                                            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                                        />

                                        {/* Gradient to blend image into card body */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0a0a0a] via-transparent to-transparent opacity-80 pointer-events-none"></div>

                                        <div className="absolute bottom-6 right-6 px-4 py-2 bg-white/80 dark:bg-black/60 backdrop-blur-md border border-zinc-200 dark:border-white/10 rounded-full flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-white shadow-lg">
                                            <ImageIcon size={14} className="text-indigo-500"/> Visual Context
                                        </div>
                                    </div>
                                )}

                                {/* Paragraph Number Badge */}
                                <div className="absolute top-6 left-6 z-10 w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#151515] text-sm font-bold text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 shadow-lg font-mono">{pIndex + 1}</div>

                                {/* Content Grid */}
                                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-100 dark:divide-zinc-800">
                                    <div className="p-8 pt-20 md:pt-20 md:p-12 relative">
                                        <div className="absolute top-6 right-6 flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">English</span>
                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
                                        </div>
                                        <InteractiveText text={para.english} onWordClick={handleWordClick} />
                                    </div>
                                    <div className="p-8 pt-20 md:pt-20 md:p-12 bg-zinc-50/50 dark:bg-[#0c0c0c] relative">
                                        <div className="absolute top-6 right-6 flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Bengali</span>
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                        </div>
                                        <p className="text-xl md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed font-bengali max-w-prose">{para.bengali}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 2. Collapsible Activities Section */}
                    {unit.activities?.length > 0 && (
                        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-[#0c0c0c] transition-colors mb-16 shadow-sm">
                            {/* Trigger */}
                            <button onClick={() => toggleActivitySection(uIndex)} className="w-full flex items-center justify-between p-8 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group">
                                <div className="flex items-center gap-5">
                                    <div className={`p-3 rounded-xl transition-colors ${expandedActivities[uIndex] ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-zinc-100 dark:bg-[#1a1a1a] text-zinc-500 dark:text-zinc-400'}`}><CheckCircle2 size={24} /></div>
                                    <div className="text-left">
                                        <h3 className={`text-lg font-bold transition-colors ${expandedActivities[uIndex] ? 'text-indigo-900 dark:text-indigo-100' : 'text-zinc-900 dark:text-zinc-100'}`}>Practice Activities</h3>
                                        <p className="text-sm text-zinc-500">Click to expand {unit.activities.length} activity sets</p>
                                    </div>
                                </div>
                                <div className={`p-2 rounded-full transition-all ${expandedActivities[uIndex] ? 'rotate-180 bg-zinc-100 dark:bg-[#1a1a1a] text-zinc-900 dark:text-white' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200'}`}><ChevronDown size={20} /></div>
                            </button>

                            {/* Content */}
                            <AnimatePresence>
                                {expandedActivities[uIndex] && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                                        <div className="p-8 pt-0 space-y-8 border-t border-zinc-100 dark:border-zinc-800">
                                            <div className="h-4"></div>
                                            <div className="grid gap-8">
                                                {unit.activities.map((act, actIdx) => {
                                                    const isRevealed = revealedAnswers[`${uIndex}-${actIdx}`];
                                                    const categoryHeaders = act.columnHeaders && act.columnHeaders.length > 0 ? act.columnHeaders : (act.questions?.[0]?.options || ["Column 1", "Column 2"]);
                                                    const relatedGrammar = findRelatedGrammar(act);

                                                    return (
                                                        <div key={actIdx} className="bg-zinc-50 dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                                                            {/* Activity Header */}
                                                            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1a1a1a]">
                                                                <div className="flex-1">
                                                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <ActivityIcon type={act.type} />
                                                                            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{act.type.replace('_', ' ')}</span>
                                                                        </div>
                                                                        {relatedGrammar && (
                                                                            <Link href={`/grammar/${relatedGrammar._id}`} className="group flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors">
                                                                                    <Lightbulb size={10} className="text-indigo-500"/>
                                                                                    <span>Review Rule</span>
                                                                                    <ExternalLink size={10} className="opacity-50 group-hover:opacity-100"/>
                                                                            </Link>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium">{act.instruction}</p>
                                                                </div>
                                                                <button onClick={() => toggleReveal(uIndex, actIdx)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-[#222] transition-colors text-zinc-600 dark:text-zinc-300 whitespace-nowrap bg-white dark:bg-transparent">
                                                                        {isRevealed ? <EyeOff size={14}/> : <Eye size={14}/>}
                                                                        {isRevealed ? "Hide Answers" : "Show Answers"}
                                                                </button>
                                                            </div>

                                                            {/* Activity Content */}
                                                            <div className="p-6 space-y-6">
                                                                {act.type === 'WORD_BOX' && act.questions?.[0]?.options?.length > 0 && (
                                                                    <div className="p-4 border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl mb-4">
                                                                        <p className="text-[10px] font-bold text-indigo-500 uppercase mb-2 flex items-center gap-1"><BoxSelect size={12}/> Word Bank:</p>
                                                                            <div className="flex flex-wrap gap-2">{act.questions[0].options.map((word, wIdx) => (<span key={wIdx} className="px-3 py-1.5 bg-white dark:bg-[#1a1a1a] border border-indigo-100 dark:border-indigo-500/20 rounded-lg text-sm text-indigo-700 dark:text-indigo-300 font-bold shadow-sm select-none">{word}</span>))}</div>
                                                                    </div>
                                                                )}

                                                                {/* (Activity render logic) */}
                                                                {act.type === 'CHART_FILL' && (<div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a]"><table className="w-full min-w-[500px] text-sm text-left"><thead className="bg-zinc-50 dark:bg-[#222] text-xs uppercase text-zinc-500 font-bold"><tr>{(act.columnHeaders || []).map((h, i) => (<th key={i} className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 border-r last:border-r-0 border-zinc-200 dark:border-zinc-800">{h}</th>))}</tr></thead><tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">{act.questions.map((q, qIdx) => (<tr key={qIdx}>{(q.options || []).map((cellData, colIdx) => { const { isInput, answer, content } = getChartParts(cellData); return (<td key={colIdx} className="p-3 border-r last:border-r-0 border-zinc-200 dark:border-zinc-800 align-top">{isInput ? (<div className="relative">{isRevealed ? (<div className="px-3 py-2 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-100 dark:border-emerald-800">{answer}</div>) : (<input className="w-full bg-zinc-50 dark:bg-[#111] border border-zinc-200 dark:border-zinc-700 rounded px-3 py-2 outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-400" placeholder="Type answer..."/>)}</div>) : (<span className="text-zinc-700 dark:text-zinc-300 font-medium">{content}</span>)}</td>); })}</tr>))}</tbody></table></div>)}
                                                                {act.type === 'CAUSE_EFFECT' && (<div className="grid grid-cols-2 bg-lime-50 dark:bg-lime-900/10 border border-lime-100 dark:border-lime-900/20 rounded-t-xl"><div className="p-3 text-xs font-bold text-center text-lime-800 dark:text-lime-400 border-r border-lime-100 dark:border-lime-900/20 uppercase tracking-widest">{act.columnHeaders?.[0] || "Cause"}</div><div className="p-3 text-xs font-bold text-center text-lime-800 dark:text-lime-400 uppercase tracking-widest">{act.columnHeaders?.[1] || "Effect"}</div></div>)}
                                                                {act.type === 'CAUSE_EFFECT' && (
                                                                    <div className="space-y-0 divide-y divide-zinc-200 dark:divide-zinc-800 border border-t-0 border-zinc-200 dark:border-zinc-800 rounded-b-xl overflow-hidden bg-white dark:bg-[#1a1a1a]">
                                                                            {act.questions.map((q, qIdx) => { const hideLeft = q.options && q.options[0] === 'CAUSE'; const hideRight = q.options && q.options[0] === 'EFFECT'; return (<div key={qIdx} className="grid grid-cols-2"><div className="p-4 text-sm border-r border-zinc-200 dark:border-zinc-800">{hideLeft ? (isRevealed ? <span className="font-bold text-emerald-600 dark:text-emerald-400">{q.leftItem}</span> : <div className="flex justify-center"><div className="h-6 w-16 bg-zinc-100 dark:bg-[#222] rounded border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 text-xs">?</div></div>) : <span className="text-zinc-700 dark:text-zinc-300">{q.leftItem}</span>}</div><div className="p-4 text-sm">{hideRight ? (isRevealed ? <span className="font-bold text-emerald-600 dark:text-emerald-400">{q.rightItem}</span> : <div className="flex justify-center"><div className="h-6 w-16 bg-zinc-100 dark:bg-[#222] rounded border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 text-xs">?</div></div>) : <span className="text-zinc-700 dark:text-zinc-300">{q.rightItem}</span>}</div></div>); })}
                                                                    </div>
                                                                )}

                                                                {/* Standard Question Loop for other types */}
                                                                {!['CAUSE_EFFECT', 'CHART_FILL'].includes(act.type) && act.questions.map((q, qIdx) => (
                                                                    <div key={qIdx} className="relative pb-4 last:pb-0 border-b last:border-0 border-dashed border-zinc-200 dark:border-zinc-800">
                                                                            <div className="flex gap-4">
                                                                                <span className="text-sm font-bold text-zinc-400 font-mono mt-0.5">{qIdx + 1}.</span>
                                                                                <div className="w-full">
                                                                                    {!['MATCHING', 'UNDERLINE', 'UNDERLINE_CIRCLE', 'CATEGORIZE'].includes(act.type) && q.text && (<p className="text-base text-zinc-800 dark:text-zinc-200 mb-3 leading-snug">{cleanText(q.text)}</p>)}

                                                                                    {/* RENDERERS */}
                                                                                    {act.type === 'MCQ' && (<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{q.options?.map((opt, oIdx) => (<div key={oIdx} className={`px-4 py-3 rounded-lg text-sm border transition-all ${isRevealed && opt === q.correctAnswer ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm' : 'bg-white dark:bg-[#1a1a1a] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'}`}><span className="font-mono text-xs mr-2 opacity-50">{String.fromCharCode(97 + oIdx)})</span>{opt}</div>))}</div>)}
                                                                                    {act.type === 'TRUE_FALSE' && (<div className="flex gap-2">{isRevealed && <span className={`text-xs font-bold px-3 py-1 rounded-full border ${q.isTrue ? 'bg-emerald-100 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'}`}>{q.isTrue ? 'TRUE' : 'FALSE'}</span>} {q.supportingStatement && isRevealed && <p className="text-sm text-zinc-500 italic mt-1 border-l-2 border-zinc-300 pl-3">"{q.supportingStatement}"</p>}</div>)}
                                                                                    {(act.type === 'FILL_BLANKS' || act.type === 'QA' || act.type === 'WORD_BOX') && isRevealed && (<div className="mt-3 p-3 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-lg"><p className="text-sm text-emerald-800 dark:text-emerald-300"><span className="font-bold mr-2 uppercase text-xs tracking-wider">Answer:</span> {q.correctAnswer}</p></div>)}
                                                                                    {act.type === 'REARRANGE' && (<div className="space-y-2">{!isRevealed ? ([...q.options].sort().map((opt, i) => (<div key={i} className="flex gap-3 items-start p-3 bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg"><span className="text-xs font-bold text-zinc-400 w-4 pt-0.5">{String.fromCharCode(65+i)}.</span><p className="text-sm text-zinc-600 dark:text-zinc-400">{opt}</p></div>))) : (q.options.map((opt, i) => (<div key={i} className="flex gap-3 items-start p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-lg"><span className="text-xs font-bold text-emerald-600 w-4 pt-0.5">{i+1}.</span><p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium">{opt}</p></div>)))}</div>)}
                                                                                    {act.type === 'UNDERLINE' && (<div className="space-y-3"><p className="text-lg text-zinc-800 dark:text-zinc-100 mb-1 leading-snug">{cleanText(q.text)}</p>{isRevealed && (<div className="p-3 rounded-lg border bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30"><div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase mb-2"><CheckCircle2 size={12}/> Correct Answer:</div><div className="text-sm text-zinc-700 dark:text-zinc-300">{renderUnderlineAnswer(q.text)}</div></div>)}</div>)}
                                                                                    {act.type === 'MATCHING' && (<div className="flex items-center justify-between p-4 rounded-lg bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800"><span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">{q.leftItem}</span><div className="flex items-center gap-2 px-4"><div className="h-px w-8 bg-zinc-300 dark:bg-zinc-700"></div>{isRevealed ? <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">MATCH</span> : <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>}<div className="h-px w-8 bg-zinc-300 dark:bg-zinc-700"></div></div><span className={`text-sm font-medium ${isRevealed ? 'text-zinc-900 dark:text-white' : 'blur-sm text-zinc-400 select-none'}`}>{q.rightItem}</span></div>)}
                                                                                    {act.type === 'CATEGORIZE' && (<div className="space-y-4"><p className="text-base text-zinc-800 dark:text-zinc-100 mb-1 leading-snug">{cleanText(q.text)}</p>{isRevealed && (<div className="mt-2 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden"><div className="grid bg-zinc-50 dark:bg-[#1a1a1a] border-b border-zinc-200 dark:border-zinc-800" style={{ gridTemplateColumns: `repeat(${categoryHeaders.length}, 1fr)` }}>{categoryHeaders.map((header, hIdx) => (<div key={hIdx} className="p-3 text-xs font-bold text-center text-zinc-600 dark:text-zinc-300 border-r border-zinc-200 dark:border-zinc-800 last:border-0 uppercase tracking-wider">{header}</div>))}</div><div className="grid bg-white dark:bg-[#111]" style={{ gridTemplateColumns: `repeat(${categoryHeaders.length}, 1fr)` }}>{categoryHeaders.map((_, hIdx) => (<div key={hIdx} className="p-3 text-sm text-center border-r border-zinc-200 dark:border-zinc-800 last:border-0 min-h-[40px]">{getCategorizedWords(q.text, hIdx).map((word, wIdx) => (<span key={wIdx} className="block mb-1 text-emerald-600 dark:text-emerald-400 font-medium">{word}</span>))}</div>))}</div></div>)}</div>)}
                                                                                </div>
                                                                            </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* --- WRITING SKILLS --- */}
                    {unit.writings?.length > 0 && (
                        <div className="mt-24 pt-12 border-t border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/20 text-rose-600 rounded-xl flex items-center justify-center shadow-inner"><Feather size={20} /></div>
                                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Writing Studio</h3>
                            </div>
                            <div className="space-y-16">
                                {unit.writings.map((write, wIdx) => (
                                    <div key={wIdx} className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 sm:p-10 shadow-lg relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-32 bg-gradient-to-br from-rose-500/5 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-rose-500/10 transition-colors duration-500"></div>

                                        <div className="mb-8 relative z-10">
                                            <span className="inline-block px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold tracking-wider uppercase mb-4 border border-rose-100 dark:border-rose-900/30 shadow-sm">{write.type.replace('_', ' ')}</span>
                                            <h4 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug">{write.question}</h4>
                                        </div>

                                        {/* --- CONTENT RENDER LOGIC --- */}
                                        {write.type === 'DIALOGUE' ? (
                                            <div className="space-y-6">{(write.data?.characters?.length > 0 || write.data?.setting) && (<div className="flex flex-wrap gap-4 p-5 bg-zinc-50 dark:bg-[#111] rounded-xl border border-zinc-200 dark:border-zinc-800">{write.data.setting && (<div className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400"><MapPin size={14} className="text-indigo-500"/><span>{write.data.setting}</span></div>)}{write.data.characters && (<div className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400"><Users size={14} className="text-indigo-500"/><span>{write.data.characters.join(' & ')}</span></div>)}</div>)}{write.modelAnswer && (<AnimatePresence>{revealedAnswers[`${uIndex}-write-${wIdx}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="mt-6 p-8 bg-white dark:bg-[#151515] border-l-4 border-indigo-500 rounded-r-xl shadow-sm">{renderDialogueScript(write.modelAnswer)}</div></motion.div>)}</AnimatePresence>)}</div>
                                        ) : write.type === 'SUMMARY' ? (
                                            <div className="space-y-6">{write.data?.passage && (<div className="p-8 bg-zinc-50 dark:bg-[#151515] rounded-xl border border-zinc-200 dark:border-zinc-800 relative group"><div className="absolute top-0 right-0 px-3 py-1 bg-zinc-200 dark:bg-zinc-800 rounded-bl-xl text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Passage</div><p className="text-base md:text-lg leading-relaxed font-serif text-zinc-800 dark:text-zinc-300 whitespace-pre-wrap">{write.data.passage}</p></div>)}{write.data?.wordLimit && (<div className="flex justify-end"><span className="text-xs font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full">Limit: {write.data.wordLimit}</span></div>)}{write.modelAnswer && (<AnimatePresence>{revealedAnswers[`${uIndex}-write-${wIdx}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="mt-4 p-8 bg-emerald-50/50 dark:bg-emerald-900/10 border-l-4 border-emerald-500 rounded-r-xl"><h5 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-3 tracking-widest">Model Summary</h5><p className="whitespace-pre-wrap text-base leading-relaxed text-zinc-800 dark:text-zinc-200 font-serif">{write.modelAnswer}</p></div></motion.div>)}</AnimatePresence>)}</div>
                                        ) : (
                                            /* Generic or Letter Logic */
                                            <>{['INFORMAL_LETTER', 'FORMAL_LETTER'].includes(write.type) && revealedAnswers[`${uIndex}-write-${wIdx}`] ? (
                                                <div className="mt-8 bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 p-8 sm:p-12 rounded-xl font-serif text-base leading-loose text-zinc-800 dark:text-zinc-200 shadow-xl">
                                                    <div className="flex flex-col items-end text-right mb-10 text-zinc-600 dark:text-zinc-400 text-sm">{write.data?.senderAddress && (<div className="whitespace-pre-wrap mb-1">{write.data.senderAddress}</div>)}{write.data?.date && (<div className="font-bold">{write.data.date}</div>)}</div>
                                                    <div className="mb-8 space-y-3">{write.data?.subject && (<p className="font-bold underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-700 text-zinc-900 dark:text-zinc-100">Subject: {write.data.subject}</p>)}{write.data?.salutation && (<p>{write.data.salutation}</p>)}</div>
                                                    <div className="whitespace-pre-wrap mb-16 text-justify">{write.modelAnswer}</div>
                                                    <div className="flex flex-col sm:flex-row justify-between items-end gap-12 pt-8 border-t border-zinc-100 dark:border-zinc-800"><div className="text-left w-full sm:w-1/2 text-zinc-600 dark:text-zinc-400 text-sm"><p className="font-bold mb-2 text-zinc-900 dark:text-zinc-100">To,</p><div className="whitespace-pre-wrap">{write.data?.receiverAddress}</div></div><div className="text-right w-full sm:w-1/2"><p className="mb-6 italic">{write.data?.closing || "Yours faithfully,"}</p><p className="font-bold text-xl text-zinc-900 dark:text-zinc-100">{write.data?.senderName}</p></div></div>
                                                </div>
                                            ) : (
                                                /* Hints & Charts */
                                                <>{write.type === 'FAMILY_CHART' && write.data?.familyMembers && (<div className="my-10 p-8 bg-zinc-50 dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-x-auto custom-scrollbar shadow-inner"><div className="min-w-max"><FamilyTree members={write.data.familyMembers} parentId={write.data.familyMembers.find(m=>!m.parentId || m.parentId==='root')?.parentId || null} /></div></div>)}{write.data?.hints && write.data.hints.length > 0 && (<div className="mb-8 p-6 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl"><p className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wide mb-4 flex items-center gap-2"><Lightbulb size={14}/> Points to Cover:</p><div className="flex flex-wrap gap-2">{write.data.hints.map((hint, hIdx) => (<span key={hIdx} className="px-3 py-1.5 bg-white dark:bg-[#1a1a1a] border border-amber-200 dark:border-amber-800/50 rounded-lg text-xs font-medium text-amber-900 dark:text-amber-200 shadow-sm">{hint}</span>))}</div></div>)}{write.modelAnswer && !['INFORMAL_LETTER', 'FORMAL_LETTER'].includes(write.type) && (<AnimatePresence>{revealedAnswers[`${uIndex}-write-${wIdx}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="mt-6 p-8 bg-zinc-50 dark:bg-[#151515] border-l-4 border-rose-400 rounded-r-xl"><p className="whitespace-pre-wrap text-base leading-relaxed text-zinc-700 dark:text-zinc-300 font-serif">{write.modelAnswer}</p></div></motion.div>)}</AnimatePresence>)}</>
                                            )}</>
                                        )}

                                        {/* --- REVEAL BUTTON --- */}
                                        {write.modelAnswer && (
                                            <div className="mt-8 pt-6 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex justify-end">
                                                <button onClick={() => toggleReveal(uIndex, `write-${wIdx}`)} className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-lg">
                                                    {revealedAnswers[`${uIndex}-write-${wIdx}`] ? <EyeOff size={14}/> : <Eye size={14}/>}
                                                    {revealedAnswers[`${uIndex}-write-${wIdx}`]
                                                        ? (['INFORMAL_LETTER', 'FORMAL_LETTER'].includes(write.type) ? "Hide Letter" : "Hide Model Answer")
                                                        : (['INFORMAL_LETTER', 'FORMAL_LETTER'].includes(write.type) ? "View Full Letter" : "View Model Answer")
                                                    }
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            ))}
        </motion.div>

        {/* --- DICTIONARY MODAL --- */}
        <AnimatePresence>
            {selectedWord && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={() => setSelectedWord(null)}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#111]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Book size={18}/></div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">Dictionary</h3>
                            </div>
                            <button onClick={() => setSelectedWord(null)} className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-black dark:hover:text-white"><X size={18}/></button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {selectedWord.loading ? (
                                <div className="flex flex-col items-center py-8 text-zinc-400 gap-3">
                                    <Loader2 size={24} className="animate-spin text-indigo-500"/>
                                    <p className="text-xs">Fetching definition...</p>
                                </div>
                            ) : selectedWord.error ? (
                                <div className="text-center py-6">
                                    <p className="text-zinc-500 text-sm mb-4">Definition not found.</p>
                                    <a href={`https://translate.google.com/?sl=en&tl=bn&text=${selectedWord.word}&op=translate`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20">
                                        <Languages size={14}/> Translate to Bengali
                                    </a>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <h2 className="text-3xl font-black text-zinc-900 dark:text-white capitalize leading-none mb-1 tracking-tight">{selectedWord.data.word}</h2>
                                            <span className="text-indigo-500 font-mono text-sm font-medium">{selectedWord.data.phonetic}</span>
                                        </div>
                                        {selectedWord.data.phonetics?.find(p => p.audio)?.audio && (
                                            <button onClick={() => new Audio(selectedWord.data.phonetics.find(p => p.audio).audio).play()} className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:scale-110 active:scale-95 transition-all shadow-sm">
                                                <Volume2 size={20}/>
                                            </button>
                                        )}
                                    </div>

                                    {/* Meanings */}
                                    <div className="space-y-4 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                                        {selectedWord.data.meanings?.slice(0, 2).map((m, i) => (
                                            <div key={i}>
                                                <span className="inline-block text-[10px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded mb-2 uppercase tracking-wide">{m.partOfSpeech}</span>
                                                <ul className="space-y-3">
                                                    {m.definitions.slice(0, 2).map((d, j) => (
                                                        <li key={j} className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed pl-3 border-l-2 border-zinc-200 dark:border-zinc-700">
                                                            {d.definition}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Footer */}
                                    <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                        <a href={`https://translate.google.com/?sl=en&tl=bn&text=${selectedWord.word}&op=translate`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl">
                                            <Languages size={14}/> Translate to Bengali
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- FLASHCARD MODAL --- */}
        {showFlashcards && (
            <FlashcardRunner
                cards={flashcardDeck}
                onClose={() => setShowFlashcards(false)}
            />
        )}

      </main>

      {/* --- Hidden PDF Template --- */}
      <div className="absolute top-0 left-0 w-full -z-50 opacity-0 pointer-events-none"><div ref={pdfRef} style={{ backgroundColor: '#ffffff', color: '#000000', padding: '40px 50px', fontFamily: '"Georgia", serif' }}><div style={{ textAlign: 'center', marginBottom: '40px', paddingBottom: '20px', borderBottom: '2px solid #000' }}><h1 style={{ fontSize: '32px', textTransform: 'uppercase', marginBottom: '10px' }}>{chapter.title}</h1><p style={{ fontSize: '14px', color: '#666' }}>Class {chapter.classLevel} &bull; {chapter.author || 'EnglishMastery'}</p></div>{chapter.units.map((unit, uIndex) => (<div key={uIndex} style={{ marginBottom: '50px', pageBreakInside: 'avoid' }}><h2 style={{ fontSize: '18px', borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: '20px', textTransform: 'uppercase' }}>Unit {uIndex + 1}: {unit.title}</h2><div style={{ marginBottom: '30px' }}>{unit.paragraphs.map((para, pIndex) => (<div key={pIndex} style={{ display: 'flex', marginBottom: '15px', gap: '20px' }}><div style={{ width: '50%', paddingRight: '15px', borderRight: '1px solid #eee', fontSize: '12px', lineHeight: '1.5' }}>{para.english}</div><div style={{ width: '50%', fontSize: '12px', lineHeight: '1.5', fontFamily: 'sans-serif' }}>{para.bengali}</div></div>))}</div></div>))}<div style={{ textAlign: 'center', fontSize: '10px', color: '#999', marginTop: '50px' }}>Downloaded from EnglishMastery</div></div></div>
      <ChapterChatbot
            chapterId={chapter._id}
            chapterTitle={chapter.title}
            />
    </div>
  );
}

// ----------------------------------------------------------------------
// NEW COMPONENT: CHAPTER SKELETON LOADER
// ----------------------------------------------------------------------
const ChapterSkeleton = () => (
  <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-200">
    <div className="fixed top-0 inset-x-0 z-40 border-b border-zinc-200/50 dark:border-white/5 bg-white/60 dark:bg-black/60 backdrop-blur-md h-16 flex items-center px-6 justify-between">
       <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse"/>
          <div className="space-y-2">
             <div className="w-20 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse"/>
             <div className="w-40 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse"/>
          </div>
       </div>
       <div className="w-24 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse"/>
    </div>

    <main className="max-w-5xl mx-auto px-6 pt-32 pb-20">
       <div className="flex flex-col items-center gap-4 mb-24">
          <div className="w-full h-64 rounded-3xl bg-zinc-200 dark:bg-zinc-800 animate-pulse mb-8"/>
          <div className="w-32 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse"/>
          <div className="w-3/4 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse"/>
       </div>

       {[1, 2].map(i => (
          <div key={i} className="mb-24">
             <div className="flex items-center gap-4 mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse"/>
                <div className="space-y-2">
                   <div className="w-16 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse"/>
                   <div className="w-64 h-6 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse"/>
                </div>
             </div>

             <div className="space-y-6">
                {[1, 2].map(j => (
                   <div key={j} className="h-80 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 overflow-hidden grid md:grid-cols-2 animate-pulse">
                      <div className="p-8 space-y-4">
                         <div className="w-full h-4 rounded bg-zinc-200 dark:bg-zinc-800"/>
                         <div className="w-3/4 h-4 rounded bg-zinc-200 dark:bg-zinc-800"/>
                         <div className="w-5/6 h-4 rounded bg-zinc-200 dark:bg-zinc-800"/>
                      </div>
                      <div className="p-8 space-y-4 bg-zinc-50/50 dark:bg-black/20">
                         <div className="w-full h-4 rounded bg-zinc-200 dark:bg-zinc-800"/>
                         <div className="w-3/4 h-4 rounded bg-zinc-200 dark:bg-zinc-800"/>
                      </div>
                   </div>
                ))}
             </div>
          </div>
       ))}
    </main>
  </div>
);

// --- NEW COMPONENT: FLASHCARD RUNNER (Same Logic, Darker Style) ---
const FlashcardRunner = ({ cards, onClose }) => {
    const [index, setIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [definition, setDefinition] = useState(null);
    const [loadingDef, setLoadingDef] = useState(false);

    useEffect(() => {
        const fetchDef = async () => {
            const word = cards[index].word;
            setLoadingDef(true);
            try {
                const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
                if (res.ok) {
                    const data = await res.json();
                    setDefinition(data[0]);
                } else {
                    setDefinition(null);
                }
            } catch (e) {
                setDefinition(null);
            } finally {
                setLoadingDef(false);
            }
        };
        if(isFlipped && !definition) {
            fetchDef();
        } else if (!isFlipped) {
            const t = setTimeout(() => setDefinition(null), 300);
            return () => clearTimeout(t);
        }
    }, [index, isFlipped]);

    const handleNext = (e) => { e.stopPropagation(); if (index < cards.length - 1) { setIsFlipped(false); setTimeout(() => setIndex(prev => prev + 1), 200); } };
    const handlePrev = (e) => { e.stopPropagation(); if (index > 0) { setIsFlipped(false); setTimeout(() => setIndex(prev => prev - 1), 200); } };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl p-6" onClick={onClose}>
            <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"><X size={24}/></button>
            <div className="flex flex-col items-center w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-10 text-zinc-400 font-mono text-xs tracking-widest uppercase">
                    <span>Card {index + 1}</span>
                    <div className="w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-white" initial={{ width: 0 }} animate={{ width: `${((index + 1) / cards.length) * 100}%` }} transition={{ duration: 0.3 }} />
                    </div>
                    <span>of {cards.length}</span>
                </div>
                <div className="relative w-full aspect-[3/2] cursor-pointer group" style={{ perspective: "1200px" }} onClick={() => setIsFlipped(!isFlipped)}>
                    <motion.div className="w-full h-full relative" style={{ transformStyle: "preserve-3d" }} initial={false} animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
                        {/* Front */}
                        <div className="absolute inset-0 bg-[#111] border border-zinc-800 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8" style={{ backfaceVisibility: "hidden" }}>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-6">Vocabulary</span>
                            <h2 className="text-5xl font-black text-white text-center capitalize tracking-tight">{cards[index].word}</h2>
                            <div className="absolute bottom-8 flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-widest font-bold"><RotateCw size={12}/> Tap to flip</div>
                        </div>
                        {/* Back */}
                        <div className="absolute inset-0 bg-white text-black rounded-3xl shadow-2xl flex flex-col items-center justify-center p-10 overflow-hidden" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                            {loadingDef ? <Loader2 className="animate-spin opacity-50" /> : definition ? (
                                <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
                                    <div><h3 className="text-3xl font-bold capitalize mb-1">{definition.word}</h3>{definition.phonetic && <span className="text-zinc-500 font-mono text-sm">{definition.phonetic}</span>}</div>
                                    <div className="w-12 h-1 bg-zinc-100 mx-auto rounded-full"/>
                                    <div className="text-lg leading-relaxed font-medium opacity-90 line-clamp-4">"{definition.meanings?.[0]?.definitions?.[0]?.definition}"</div>
                                    {definition.meanings?.[0]?.partOfSpeech && <span className="inline-block px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold uppercase tracking-wider text-zinc-500">{definition.meanings[0].partOfSpeech}</span>}
                                </div>
                            ) : (
                                <div className="text-center"><p className="mb-6 text-zinc-500 text-sm font-medium">Definition unavailable.</p><a href={`https://translate.google.com/?sl=en&tl=bn&text=${cards[index].word}&op=translate`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full text-xs font-bold hover:scale-105 transition-transform" onClick={(e) => e.stopPropagation()}><Languages size={14}/> See Meaning</a></div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

// --- HELPER COMPONENT: CLICKABLE WORD RENDERER ---
const InteractiveText = ({ text, onWordClick }) => {
    const parts = text.split(/([a-zA-Z]+(?:['’-][a-zA-Z]+)?)/g);
    return (
        <p className="text-lg md:text-xl text-zinc-900 dark:text-zinc-100 leading-relaxed font-serif max-w-prose">
            {parts.map((part, i) => {
                if (/[a-zA-Z]/.test(part)) {
                    return (
                        <span key={i} onClick={() => onWordClick(part)} className="cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-500/30 hover:text-yellow-900 dark:hover:text-yellow-100 rounded px-0.5 transition-colors">{part}</span>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </p>
    );
};

const FamilyTree = ({ members, parentId = null }) => {
    const children = members.filter(m => m.parentId === parentId);
    if (children.length === 0) return null;
    return (
        <div className="flex justify-center gap-12 pt-12 relative">
            {children.map((child, index) => {
                const spouse = members.find(m => m.id === child.partnerId);
                const hasChildren = members.some(m => m.parentId === child.id);
                return (
                    <div key={child.id} className="flex flex-col items-center relative">
                        {parentId !== null && <div className="absolute -top-12 left-1/2 w-px h-12 bg-zinc-300 dark:bg-zinc-700"></div>}
                        {children.length > 1 && (<><div className={`absolute -top-12 h-px bg-zinc-300 dark:bg-zinc-700 ${index === 0 ? 'w-1/2 right-0' : 'w-full left-0'}`}></div><div className={`absolute -top-12 h-px bg-zinc-300 dark:bg-zinc-700 ${index === children.length - 1 ? 'w-1/2 left-0' : 'w-full right-0'}`}></div></>)}
                        <div className="flex items-center relative z-10 gap-6">
                            <FamilyMemberCard member={child} />
                            {spouse && (<><div className="w-10 h-px bg-zinc-300 dark:bg-zinc-600 relative flex items-center justify-center"><div className="p-1.5 bg-white dark:bg-[#1a1a1a] rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm"><Heart size={10} className="text-rose-500 fill-rose-500" /></div></div><FamilyMemberCard member={spouse} isSpouse={true} /></>)}
                        </div>
                        {hasChildren && (<div className="relative mt-0"><div className={`absolute -top-0 w-px h-12 bg-zinc-300 dark:bg-zinc-700 ${spouse ? 'left-[calc(50%-1.5rem)]' : 'left-1/2'}`}></div><FamilyTree members={members} parentId={child.id} /></div>)}
                    </div>
                );
            })}
        </div>
    );
};

const FamilyMemberCard = ({ member, isSpouse = false }) => (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} className={`flex flex-col items-center justify-center w-32 h-32 p-4 rounded-full shadow-lg border-2 transition-all z-10 bg-white dark:bg-[#1a1a1a] ${isSpouse ? 'border-rose-100 dark:border-rose-900/30' : 'border-indigo-50 dark:border-indigo-900/30'}`}>
        <span className={`text-[10px] font-bold uppercase tracking-wider mb-2 text-center leading-none ${isSpouse ? 'text-rose-500' : 'text-indigo-500'}`}>{member.relation}</span>
        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 text-center leading-tight mb-1 line-clamp-2">{member.name}</h4>
        {member.details && <span className="text-[10px] text-zinc-400 text-center leading-none px-1 mt-0.5 font-medium">{member.details}</span>}
    </motion.div>
);

const ActivityIcon = ({ type }) => {
    switch(type) {
        case 'MCQ': return <ListChecks size={14} className="text-blue-500" />;
        case 'MATCHING': return <SplitSquareHorizontal size={14} className="text-pink-500" />;
        case 'TRUE_FALSE': return <CheckCircle2 size={14} className="text-orange-500" />;
        case 'QA': return <HelpCircle size={14} className="text-gray-500" />;
        case 'REARRANGE': return <ArrowDownUp size={14} className="text-teal-500" />;
        case 'UNDERLINE': return <Type size={14} className="text-cyan-500" />;
        case 'UNDERLINE_CIRCLE': return <Highlighter size={14} className="text-rose-500" />;
        case 'WORD_BOX': return <BoxSelect size={14} className="text-indigo-500" />;
        case 'CATEGORIZE': return <Table2 size={14} className="text-amber-500" />;
        case 'CAUSE_EFFECT': return <ArrowRightLeft size={14} className="text-lime-500" />;
        case 'CHART_FILL': return <Grid3X3 size={14} className="text-indigo-500" />;
        default: return <FileText size={14} className="text-purple-500" />;
    }
}
