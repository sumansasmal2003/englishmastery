"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Loader2, Layers, CheckCircle2, Download,
  Eye, EyeOff, ListChecks, SplitSquareHorizontal, HelpCircle, FileText, ChevronDown, ArrowDownUp, Type, BoxSelect, Highlighter, Table2, Feather, Network, Heart, ArrowRightLeft,
  Lightbulb, Grid3X3,
  Users,
  MapPin
} from "lucide-react";
import ChapterChatbot from "@/components/ChapterChatbot";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } },
};

export default function ChapterDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Toggle States
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [expandedActivities, setExpandedActivities] = useState({});

  const pdfRef = useRef();

  useEffect(() => {
    if (!id) return;
    async function fetchChapter() {
      try {
        const res = await fetch(`/api/chapters/${id}`);
        const data = await res.json();
        if (data.success) setChapter(data.data);
      } catch (error) {
        console.error("Error fetching chapter:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchChapter();
  }, [id]);

  const toggleReveal = (uid, aid) => {
    const key = `${uid}-${aid}`;
    setRevealedAnswers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleActivitySection = (uIndex) => {
      setExpandedActivities(prev => ({ ...prev, [uIndex]: !prev[uIndex] }));
  };

  // --- Helpers for Text Parsing ---
  const cleanText = (text) => text?.replace(/[{}[\]]/g, "").replace(/\|(\d+)/g, "") || "";

  const renderDialogueScript = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
        // Regex to find "Name: Message" pattern
        const match = line.match(/^(.+?):\s*(.*)/);
        if (match) {
            return (
                <div key={i} className="flex gap-3 mb-3">
                    <div className="shrink-0 text-sm font-bold text-indigo-600 dark:text-indigo-400 min-w-[80px] text-right">
                        {match[1]}
                    </div>
                    <div className="text-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg rounded-tl-none border border-zinc-100 dark:border-zinc-800 shadow-sm">
                        {match[2]}
                    </div>
                </div>
            );
        }
        // Fallback for lines without names (e.g. stage directions)
        if (line.trim()) {
            return <p key={i} className="text-xs text-zinc-400 italic mb-2 pl-24">{line}</p>;
        }
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
    if (match) {
        return { isInput: true, answer: match[1].trim() };
    }
    return { isInput: false, content: text };
  };

  const renderUnderlineCircleAnswer = (text) => {
    if (!text) return null;
    const parts = text.split(/(\{.*?\}|\[.*?\])/g);
    return (
        <span className="leading-loose text-lg">
            {parts.map((part, i) => {
                if (part.startsWith('{') && part.endsWith('}')) {
                    return <span key={i} className="font-bold text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 mx-1">{part.slice(1, -1)}</span>;
                }
                if (part.startsWith('[') && part.endsWith(']')) {
                    return <span key={i} className="font-bold text-orange-600 dark:text-orange-400 border-2 border-orange-500 rounded-full px-2 py-0.5 mx-1 inline-block">{part.slice(1, -1)}</span>;
                }
                return <span key={i}>{part}</span>;
            })}
        </span>
    );
  };

  const getCategorizedWords = (text, columnIndex) => {
      if (!text) return [];
      const matches = text.match(/\{(.+?)\|(\d+)\}/g) || [];
      return matches
          .map(m => {
              const content = m.slice(1, -1);
              const [word, idx] = content.split('|');
              return parseInt(idx) === columnIndex ? word : null;
          })
          .filter(Boolean);
  };

  const handleDownloadPDF = async () => {
    if (!chapter) return;
    setDownloading(true);
    try {
        const html2pdf = (await import("html2pdf.js")).default;
        const element = pdfRef.current;
        const opt = {
          margin:       [0.5, 0.5, 0.5, 0.5],
          filename:     `${chapter.title.replace(/\s+/g, '_')}_TextOnly.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        await html2pdf().set(opt).from(element).save();
    } catch (err) {
        console.error("PDF Failed", err);
        alert("Could not generate PDF");
    } finally {
        setDownloading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-[#050505] flex flex-col items-center justify-center text-zinc-400 gap-3">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
        <p className="text-xs uppercase tracking-widest animate-pulse">Loading Content</p>
    </div>
  );

  if (!chapter) return <div className="min-h-screen bg-white dark:bg-[#050505] flex items-center justify-center text-zinc-500">Chapter not found.</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-zinc-900 dark:text-zinc-200 font-sans selection:bg-indigo-500/30 relative">

      {/* --- BACKGROUND GRID --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#ffffff00,white)] dark:bg-[radial-gradient(circle_800px_at_50%_200px,#00000000,#050505)]"></div>
      </div>

      {/* --- Header --- */}
      <header className="fixed top-0 inset-x-0 z-40 border-b border-zinc-200/50 dark:border-white/5 bg-white/60 dark:bg-black/60 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                    <ArrowLeft size={18} className="text-zinc-500 dark:text-zinc-400" />
                </button>
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-bold">Class {chapter.classLevel}</span>
                    <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] sm:max-w-md">{chapter.title}</h1>
                </div>
            </div>
            <button onClick={handleDownloadPDF} disabled={downloading} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded-full hover:opacity-90 transition-all disabled:opacity-50">
                {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                <span className="hidden sm:inline">{downloading ? "Generating..." : "Download PDF"}</span>
            </button>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-20">

        {/* Title Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-24 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-sm">
                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 font-medium">Chapter {chapter.chapterNumber}</span>
                {chapter.author && <><span className="text-zinc-300 dark:text-zinc-700">•</span><span className="text-zinc-600 dark:text-zinc-400 text-xs font-medium">{chapter.author}</span></>}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-[1.1]">{chapter.title}</h1>
        </motion.div>

        {/* Units Loop */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-24">
            {chapter.units.map((unit, uIndex) => (
                <motion.div key={uIndex} variants={itemVariants} className="relative">

                    {/* Unit Header */}
                    <div className="flex items-center gap-4 mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                            <Layers size={20} />
                        </div>
                        <div>
                             <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Unit {uIndex + 1}</span>
                             <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-none mt-1">{unit.title}</h2>
                        </div>
                    </div>

                    {/* 1. Paragraphs Section */}
                    <div className="space-y-6 mb-12">
                        {unit.paragraphs.map((para, pIndex) => (
                            <div key={pIndex} className="group relative bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 shadow-sm">
                                <div className="absolute top-4 left-4 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">{pIndex + 1}</div>
                                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-100 dark:divide-zinc-800/50">
                                    <div className="p-8 pt-12 md:pt-8 relative">
                                        <div className="absolute top-4 right-4 flex items-center gap-2"><span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">English</span><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span></div>
                                        <p className="text-lg md:text-xl text-zinc-900 dark:text-zinc-100 leading-relaxed font-serif max-w-prose">{para.english}</p>
                                    </div>
                                    <div className="p-8 pt-12 md:pt-8 bg-zinc-50/50 dark:bg-black/20 relative">
                                        <div className="absolute top-4 right-4 flex items-center gap-2"><span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Bengali</span><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span></div>
                                        <p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed font-bengali max-w-prose">{para.bengali}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 2. Collapsible Activities Section */}
                    {unit.activities?.length > 0 && (
                        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white/50 dark:bg-zinc-900/20 backdrop-blur-sm transition-colors mb-12">

                            {/* Trigger */}
                            <button
                                onClick={() => toggleActivitySection(uIndex)}
                                className="w-full flex items-center justify-between p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl transition-colors ${expandedActivities[uIndex] ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className={`text-base font-bold transition-colors ${expandedActivities[uIndex] ? 'text-indigo-900 dark:text-indigo-100' : 'text-zinc-900 dark:text-zinc-100'}`}>Practice Activities</h3>
                                        <p className="text-xs text-zinc-500">{unit.activities.length} activity sets available</p>
                                    </div>
                                </div>
                                <div className={`p-2 rounded-full transition-all ${expandedActivities[uIndex] ? 'rotate-180 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-400 group-hover:text-zinc-600'}`}>
                                    <ChevronDown size={18} />
                                </div>
                            </button>

                            {/* Content */}
                            <AnimatePresence>
                                {expandedActivities[uIndex] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="p-6 pt-0 space-y-8 border-t border-zinc-200 dark:border-zinc-800/50">
                                            <div className="h-2"></div>
                                            <div className="grid gap-8">
                                                {unit.activities.map((act, actIdx) => {
                                                    const isRevealed = revealedAnswers[`${uIndex}-${actIdx}`];
                                                    const categoryHeaders = act.columnHeaders && act.columnHeaders.length > 0
                                                        ? act.columnHeaders
                                                        : (act.questions?.[0]?.options || ["Column 1", "Column 2"]);

                                                    return (
                                                        <div key={actIdx} className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">

                                                            {/* Activity Header */}
                                                            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/50">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <ActivityIcon type={act.type} />
                                                                        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{act.type.replace('_', ' ')}</span>
                                                                    </div>
                                                                    <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium">{act.instruction}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => toggleReveal(uIndex, actIdx)}
                                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-zinc-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400"
                                                                >
                                                                    {isRevealed ? <EyeOff size={14}/> : <Eye size={14}/>}
                                                                    {isRevealed ? "Hide Answers" : "Show Answers"}
                                                                </button>
                                                            </div>

                                                            {/* WORD BOX */}
                                                            {act.type === 'WORD_BOX' && act.questions?.[0]?.options?.length > 0 && (
                                                                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-indigo-50/30 dark:bg-indigo-900/10">
                                                                    <p className="text-[10px] font-bold text-indigo-400 uppercase mb-2 flex items-center gap-1">
                                                                        <BoxSelect size={12}/> Word Bank:
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {act.questions[0].options.map((word, wIdx) => (
                                                                            <span key={wIdx} className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-indigo-100 dark:border-indigo-500/20 rounded-lg text-sm text-indigo-700 dark:text-indigo-300 font-medium shadow-sm select-none">
                                                                                {word}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {act.type === 'CHART_FILL' && (
                                                                <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 m-6">
                                                                    <table className="w-full min-w-[500px] text-sm text-left">
                                                                        <thead className="bg-zinc-100 dark:bg-zinc-800 text-xs uppercase text-zinc-500 font-bold">
                                                                            <tr>
                                                                                {(act.columnHeaders || []).map((h, i) => (
                                                                                    <th key={i} className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 border-r last:border-r-0 border-zinc-200 dark:border-zinc-700">{h}</th>
                                                                                ))}
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                                                            {act.questions.map((q, qIdx) => (
                                                                                <tr key={qIdx} className="bg-white dark:bg-zinc-900/50">
                                                                                    {(q.options || []).map((cellData, colIdx) => {
                                                                                        const { isInput, answer, content } = getChartParts(cellData);
                                                                                        return (
                                                                                            <td key={colIdx} className="p-3 border-r last:border-r-0 border-zinc-100 dark:border-zinc-800 align-top">
                                                                                                {isInput ? (
                                                                                                    <div className="relative">
                                                                                                        {isRevealed ? (
                                                                                                            <div className="px-3 py-2 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-100 dark:border-emerald-800">
                                                                                                                {answer}
                                                                                                            </div>
                                                                                                        ) : (
                                                                                                            <input
                                                                                                                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-zinc-400"
                                                                                                                placeholder="Type answer..."
                                                                                                            />
                                                                                                        )}
                                                                                                    </div>
                                                                                                ) : (
                                                                                                    <span className="text-zinc-700 dark:text-zinc-300 font-medium">{content}</span>
                                                                                                )}
                                                                                            </td>
                                                                                        );
                                                                                    })}
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            )}

                                                            {/* CAUSE EFFECT HEADER */}
                                                            {act.type === 'CAUSE_EFFECT' && (
                                                                <div className="grid grid-cols-2 bg-lime-50 dark:bg-lime-900/10 border-b border-lime-100 dark:border-lime-900/20">
                                                                    <div className="p-3 text-xs font-bold text-center text-lime-800 dark:text-lime-400 border-r border-lime-100 dark:border-lime-900/20 uppercase tracking-widest">
                                                                        {act.columnHeaders?.[0] || "Cause"}
                                                                    </div>
                                                                    <div className="p-3 text-xs font-bold text-center text-lime-800 dark:text-lime-400 uppercase tracking-widest">
                                                                        {act.columnHeaders?.[1] || "Effect"}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Questions Body */}
                                                            <div className="p-6 space-y-6">

                                                                {/* --- CAUSE EFFECT TABLE --- */}
                                                                {act.type === 'CAUSE_EFFECT' ? (
                                                                    <div className="space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-lg overflow-hidden">
                                                                         {act.questions.map((q, qIdx) => {
                                                                             const hideLeft = q.options && q.options[0] === 'CAUSE';
                                                                             const hideRight = q.options && q.options[0] === 'EFFECT';

                                                                             return (
                                                                                 <div key={qIdx} className="grid grid-cols-2">
                                                                                     <div className="p-4 text-sm border-r border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
                                                                                         {hideLeft ? (
                                                                                             isRevealed ? <span className="font-bold text-emerald-600 dark:text-emerald-400">{q.leftItem}</span> : <div className="flex justify-center"><div className="h-6 w-16 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 text-xs">?</div></div>
                                                                                         ) : <span className="text-zinc-700 dark:text-zinc-300">{q.leftItem}</span>}
                                                                                     </div>
                                                                                     <div className="p-4 text-sm bg-white/50 dark:bg-zinc-900/50">
                                                                                         {hideRight ? (
                                                                                             isRevealed ? <span className="font-bold text-emerald-600 dark:text-emerald-400">{q.rightItem}</span> : <div className="flex justify-center"><div className="h-6 w-16 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 text-xs">?</div></div>
                                                                                         ) : <span className="text-zinc-700 dark:text-zinc-300">{q.rightItem}</span>}
                                                                                     </div>
                                                                                 </div>
                                                                             );
                                                                         })}
                                                                    </div>
                                                                ) : (
                                                                    /* --- ALL OTHER TYPES --- */
                                                                    act.questions.map((q, qIdx) => (
                                                                        <div key={qIdx} className="relative">
                                                                            <div className="flex gap-4">
                                                                                <span className="text-sm font-bold text-zinc-400 font-mono mt-0.5">{qIdx + 1}.</span>
                                                                                <div className="w-full">

                                                                                    {/* Question Text */}
                                                                                    {!['MATCHING', 'UNDERLINE', 'UNDERLINE_CIRCLE', 'CATEGORIZE', 'CAUSE_EFFECT', 'CHART_FILL'].includes(act.type) && q.text && (
                                                                                        <p className="text-base text-zinc-800 dark:text-zinc-100 mb-3 leading-snug">{cleanText(q.text)}</p>
                                                                                    )}

                                                                                    {/* --- CATEGORIZE TABLE --- */}
                                                                                    {act.type === 'CATEGORIZE' && (
                                                                                        <div className="space-y-4">
                                                                                            <p className="text-base text-zinc-800 dark:text-zinc-100 mb-1 leading-snug">{cleanText(q.text)}</p>
                                                                                            {isRevealed && (
                                                                                                <div className="mt-2 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                                                                                                    <div className="grid bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700" style={{ gridTemplateColumns: `repeat(${categoryHeaders.length}, 1fr)` }}>
                                                                                                        {categoryHeaders.map((header, hIdx) => (<div key={hIdx} className="p-3 text-xs font-bold text-center text-zinc-600 dark:text-zinc-300 border-r border-zinc-200 dark:border-zinc-700 last:border-0 uppercase tracking-wider">{header}</div>))}
                                                                                                    </div>
                                                                                                    <div className="grid bg-white dark:bg-zinc-900/30" style={{ gridTemplateColumns: `repeat(${categoryHeaders.length}, 1fr)` }}>
                                                                                                        {categoryHeaders.map((_, hIdx) => (
                                                                                                            <div key={hIdx} className="p-3 text-sm text-center border-r border-zinc-200 dark:border-zinc-700 last:border-0 min-h-[40px]">
                                                                                                                {getCategorizedWords(q.text, hIdx).map((word, wIdx) => (<span key={wIdx} className="block mb-1 text-emerald-600 dark:text-emerald-400 font-medium">{word}</span>))}
                                                                                                            </div>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    )}

                                                                                    {/* --- UNDERLINE --- */}
                                                                                    {act.type === 'UNDERLINE' && (<div className="space-y-3"><p className="text-base text-zinc-800 dark:text-zinc-100 mb-1 leading-snug">{cleanText(q.text)}</p>{isRevealed && (<div className="p-3 rounded-lg border bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30"><div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase mb-2"><CheckCircle2 size={12}/> Correct Answer:</div><div className="text-sm text-zinc-700 dark:text-zinc-300">{renderUnderlineAnswer(q.text)}</div></div>)}</div>)}

                                                                                    {/* --- UNDERLINE CIRCLE --- */}
                                                                                    {act.type === 'UNDERLINE_CIRCLE' && (<div className="space-y-3"><p className="text-base text-zinc-800 dark:text-zinc-100 mb-1 leading-snug">{cleanText(q.text)}</p>{isRevealed && (<div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800/50"><div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase mb-3"><CheckCircle2 size={12}/> Solution:</div><div className="text-base text-zinc-800 dark:text-zinc-200">{renderUnderlineCircleAnswer(q.text)}</div></div>)}</div>)}

                                                                                    {/* --- MCQ --- */}
                                                                                    {act.type === 'MCQ' && (<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{q.options?.map((opt, oIdx) => (<div key={oIdx} className={`px-4 py-3 rounded-lg text-sm border transition-all ${isRevealed && opt === q.correctAnswer ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-medium' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'}`}><span className="font-mono text-xs mr-2 opacity-50">{String.fromCharCode(97 + oIdx)})</span>{opt}</div>))}</div>)}

                                                                                    {/* --- REARRANGE --- */}
                                                                                    {act.type === 'REARRANGE' && (<div className="space-y-2">{!isRevealed ? ([...q.options].sort().map((opt, i) => (<div key={i} className="flex gap-3 items-start p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-lg"><span className="text-xs font-bold text-zinc-400 w-4 pt-0.5">{String.fromCharCode(65+i)}.</span><p className="text-sm text-zinc-600 dark:text-zinc-400">{opt}</p></div>))) : (q.options.map((opt, i) => (<div key={i} className="flex gap-3 items-start p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-lg"><span className="text-xs font-bold text-emerald-600 w-4 pt-0.5">{i+1}.</span><p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium">{opt}</p></div>)))}</div>)}

                                                                                    {/* --- MATCHING --- */}
                                                                                    {act.type === 'MATCHING' && (<div className="flex items-center justify-between p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800"><span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">{q.leftItem}</span><div className="flex items-center gap-2 px-4"><div className="h-px w-8 bg-zinc-300 dark:bg-zinc-700"></div>{isRevealed ? <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">Matches</span> : <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>}<div className="h-px w-8 bg-zinc-300 dark:bg-zinc-700"></div></div><span className={`text-sm font-medium ${isRevealed ? 'text-zinc-900 dark:text-white' : 'blur-sm text-zinc-400 select-none'}`}>{q.rightItem}</span></div>)}

                                                                                    {/* --- TRUE/FALSE --- */}
                                                                                    {act.type === 'TRUE_FALSE' && (<div className="flex flex-col gap-2"><div className="flex gap-2">{isRevealed && <span className={`text-xs font-bold px-2 py-1 rounded ${q.isTrue ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{q.isTrue ? 'TRUE' : 'FALSE'}</span>}</div>{q.supportingStatement && isRevealed && <p className="text-sm text-zinc-500 italic mt-1 border-l-2 border-zinc-300 pl-3">"{q.supportingStatement}"</p>}</div>)}

                                                                                    {/* --- FILL BLANKS / QA --- */}
                                                                                    {(act.type === 'FILL_BLANKS' || act.type === 'QA' || act.type === 'WORD_BOX') && isRevealed && (<div className="mt-2 p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-lg"><p className="text-sm text-emerald-800 dark:text-emerald-300"><span className="font-bold mr-2">Answer:</span> {q.correctAnswer}</p></div>)}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                )}
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
                        <div className="mt-20 pt-10 border-t border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-rose-100 dark:bg-rose-900/20 text-rose-600 rounded-lg"><Feather size={20} /></div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Writing Skills</h3>
                            </div>
                            <div className="space-y-12">
                                {unit.writings.map((write, wIdx) => (
                                    <div key={wIdx} className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">

                                        {/* Decorative Background Blob */}
                                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl" />

                                        <div className="mb-6 relative z-10">
                                            <span className="inline-block px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold tracking-wider uppercase mb-3 border border-rose-100 dark:border-rose-900/30">{write.type.replace(/_/g, ' ')}</span>
                                            <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug">{write.question}</h4>
                                        </div>

                                        {write.type === 'DIALOGUE' ? (
        <div className="space-y-6">
            {/* Context Card */}
            {(write.data?.characters?.length > 0 || write.data?.setting) && (
                <div className="flex flex-wrap gap-4 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                    {write.data.setting && (
                        <div className="flex items-center gap-2 text-xs font-medium text-indigo-800 dark:text-indigo-300">
                            <MapPin size={14} className="text-indigo-500"/>
                            <span>{write.data.setting}</span>
                        </div>
                    )}
                    {write.data.characters && (
                         <div className="flex items-center gap-2 text-xs font-medium text-indigo-800 dark:text-indigo-300">
                            <Users size={14} className="text-indigo-500"/>
                            <span>{write.data.characters.join(' & ')}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Model Answer (Script View) */}
            {write.modelAnswer && (
                <AnimatePresence>
                    {revealedAnswers[`${uIndex}-write-${wIdx}`] && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="mt-4 p-6 bg-zinc-50 dark:bg-zinc-800/30 border-l-4 border-indigo-400 rounded-r-lg">
                                {renderDialogueScript(write.modelAnswer)}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    )

                                        : write.type === 'INFORMAL_LETTER' && revealedAnswers[`${uIndex}-write-${wIdx}`] ? (
                                            <div className="mt-8 bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200 dark:border-zinc-700/50 p-6 sm:p-10 rounded-xl font-serif text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 shadow-inner">

                                                {/* 1. Top Right: Sender Address & Date */}
                                                <div className="flex flex-col items-end text-right mb-8 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
                                                    {write.data?.senderAddress && (
                                                        <div className="whitespace-pre-wrap mb-1">{write.data.senderAddress}</div>
                                                    )}
                                                    {write.data?.date && (
                                                        <div className="font-bold">{write.data.date}</div>
                                                    )}
                                                </div>

                                                {/* 2. Subject (if present) & Salutation */}
                                                <div className="mb-6 space-y-2">
                                                    {write.data?.subject && (
                                                        <p className="font-bold underline text-zinc-900 dark:text-zinc-100">Subject: {write.data.subject}</p>
                                                    )}
                                                    {write.data?.salutation && (
                                                        <p>{write.data.salutation}</p>
                                                    )}
                                                </div>

                                                {/* 3. Main Body */}
                                                <div className="whitespace-pre-wrap mb-12 text-justify">
                                                    {write.modelAnswer}
                                                </div>

                                                {/* 4. Bottom Section: Recipient (Left) & Closing (Right) */}
                                                <div className="flex flex-col sm:flex-row justify-between items-end gap-8">

                                                    {/* Bottom Left: Recipient Address */}
                                                    <div className="text-left w-full sm:w-1/2 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
                                                        <p className="font-bold mb-1">To,</p>
                                                        <div className="whitespace-pre-wrap">{write.data?.receiverAddress}</div>
                                                    </div>

                                                    {/* Bottom Right: Closing & Sender Name */}
                                                    <div className="text-right w-full sm:w-1/2">
                                                        <p className="mb-4">{write.data?.closing || "Yours faithfully,"}</p>
                                                        <p className="font-bold text-zinc-900 dark:text-zinc-100">{write.data?.senderName}</p>
                                                    </div>
                                                </div>

                                            </div>
                                        ) : (
                                            <>
                                                {/* FAMILY TREE VISUALIZER */}
                                                {write.type === 'FAMILY_CHART' && write.data?.familyMembers && (
                                                    <div className="my-8 p-8 bg-zinc-50/80 dark:bg-black/30 border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-x-auto custom-scrollbar">
                                                        <div className="min-w-max">
                                                            {(() => {
                                                                const roots = write.data.familyMembers.filter(m => !m.parentId || m.parentId === 'null' || m.parentId === 'root');
                                                                const startNode = roots.length > 0 ? roots[0].parentId : null;
                                                                return <FamilyTree members={write.data.familyMembers} parentId={startNode} />;
                                                            })()}
                                                        </div>
                                                    </div>
                                                )}

                                                {write.data?.hints && write.data.hints.length > 0 && (
                                                    <div className="mb-6 p-5 bg-amber-50/50 dark:bg-amber-900/5 border border-amber-100 dark:border-amber-800/30 rounded-xl">
                                                        <p className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wide mb-3 flex items-center gap-1"><Lightbulb size={12}/> Points / Hints:</p>
                                                        <div className="flex flex-wrap gap-2">{write.data.hints.map((hint, hIdx) => (<span key={hIdx} className="px-2.5 py-1 bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800/50 rounded-md text-xs font-medium text-amber-900 dark:text-amber-200 shadow-sm">{hint}</span>))}</div>
                                                    </div>
                                                )}

                                                {write.modelAnswer && write.type !== 'INFORMAL_LETTER' && (
                                                    <AnimatePresence>
                                                        {revealedAnswers[`${uIndex}-write-${wIdx}`] && (
                                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                                <div className="mt-4 p-6 bg-zinc-50 dark:bg-zinc-800/30 border-l-2 border-rose-400 rounded-r-lg">
                                                                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 font-serif">{write.modelAnswer}</p>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                )}
                                            </>
                                        )}

                                        {write.modelAnswer && (
                                            <div className="mt-6 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                                                <button onClick={() => toggleReveal(uIndex, `write-${wIdx}`)} className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">
                                                    {revealedAnswers[`${uIndex}-write-${wIdx}`] ? <EyeOff size={14}/> : <Eye size={14}/>}
                                                    {revealedAnswers[`${uIndex}-write-${wIdx}`]
                                                        ? (write.type === 'INFORMAL_LETTER' ? "Hide Letter" : "Hide Model Answer")
                                                        : (write.type === 'INFORMAL_LETTER' ? "View Full Letter" : "View Model Answer")
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

const FamilyTree = ({ members, parentId = null }) => {
    const children = members.filter(m => m.parentId === parentId);
    if (children.length === 0) return null;

    return (
        <div className="flex justify-center gap-8 sm:gap-16 pt-10 relative">
            {children.map((child, index) => {
                const spouse = members.find(m => m.id === child.partnerId);
                const hasChildren = members.some(m => m.parentId === child.id);
                return (
                    <div key={child.id} className="flex flex-col items-center relative">
                        {parentId !== null && <div className="absolute -top-10 left-1/2 w-px h-10 bg-zinc-300 dark:bg-zinc-700"></div>}
                        {children.length > 1 && (<><div className={`absolute -top-10 h-px bg-zinc-300 dark:bg-zinc-700 ${index === 0 ? 'w-1/2 right-0' : 'w-full left-0'}`}></div><div className={`absolute -top-10 h-px bg-zinc-300 dark:bg-zinc-700 ${index === children.length - 1 ? 'w-1/2 left-0' : 'w-full right-0'}`}></div></>)}

                        <div className="flex items-center relative z-10 gap-4">
                            <FamilyMemberCard member={child} />
                            {spouse && (
                                <>
                                    <div className="w-8 h-px bg-zinc-300 dark:bg-zinc-600 relative flex items-center justify-center">
                                        <div className="p-1 bg-white dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-700"><Heart size={8} className="text-rose-400 fill-rose-400" /></div>
                                    </div>
                                    <FamilyMemberCard member={spouse} isSpouse={true} />
                                </>
                            )}
                        </div>

                        {hasChildren && (<div className="relative mt-0"><div className={`absolute -top-0 w-px h-10 bg-zinc-300 dark:bg-zinc-700 ${spouse ? 'left-[calc(50%-1rem)]' : 'left-1/2'}`}></div><FamilyTree members={members} parentId={child.id} /></div>)}
                    </div>
                );
            })}
        </div>
    );
};

const FamilyMemberCard = ({ member, isSpouse = false }) => (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} className={`flex flex-col items-center justify-center w-28 h-28 p-3 rounded-full shadow-sm border-2 transition-all z-10 bg-white dark:bg-zinc-900 ${isSpouse ? 'border-pink-100 dark:border-pink-900/30' : 'border-indigo-50 dark:border-indigo-900/30'}`}>
        <span className={`text-[9px] font-bold uppercase tracking-wider mb-1.5 text-center leading-none ${isSpouse ? 'text-pink-500' : 'text-indigo-500'}`}>{member.relation}</span>
        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 text-center leading-tight mb-1 line-clamp-2">{member.name}</h4>
        {member.details && <span className="text-[9px] text-zinc-400 text-center leading-none px-1 mt-0.5">{member.details}</span>}
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
