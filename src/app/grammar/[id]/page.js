"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Loader2, PenTool, Lightbulb } from "lucide-react";

export default function GrammarDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function fetchTopic() {
      try {
        const res = await fetch(`/api/grammar/${id}`);
        const data = await res.json();
        if (data.success) setTopic(data.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTopic();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center justify-center text-zinc-400 gap-3">
        <Loader2 className="animate-spin w-8 h-8 text-emerald-600" />
        <p className="text-xs uppercase tracking-widest animate-pulse">Loading Grammar Rules</p>
      </div>
    );
  }

  if (!topic) return <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center text-zinc-500">Topic not found.</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-200 font-sans selection:bg-emerald-500/30">

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-40 border-b border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors">
                <ArrowLeft size={20} />
            </button>
            <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold">Grammar Reference</span>
                <h1 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{topic.topic}</h1>
            </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">

        {/* Title Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-16 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400 mb-6">
                <PenTool size={24} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">{topic.topic}</h1>
            {topic.description && <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">{topic.description}</p>}
        </motion.div>

        {/* Sections Loop */}
        <div className="space-y-12">
            {topic.sections.map((sec, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="group bg-white dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none"
                >
                    {/* Rule Header */}
                    <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="px-2 py-1 bg-zinc-200 dark:bg-zinc-800 rounded text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Rule {idx + 1}</span>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{sec.title}</h2>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{sec.content}</p>
                    </div>

                    {/* Examples Area */}
                    {sec.examples.length > 0 && (
                        <div className="p-6 md:p-8 bg-white dark:bg-transparent">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Lightbulb size={14} className="text-amber-500" /> Examples
                            </h3>
                            <div className="grid gap-3">
                                {sec.examples.map((ex, exIdx) => (
                                    <div key={exIdx} className="flex gap-4 items-start p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                                        <div>
                                            <p className="text-base font-medium text-zinc-800 dark:text-zinc-200 font-serif italic">"{ex.sentence}"</p>
                                            {ex.explanation && (
                                                <p className="text-sm text-zinc-500 mt-1">{ex.explanation}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            ))}
        </div>

        {/* Footer Navigation */}
        <div className="mt-32 pt-10 border-t border-zinc-200 dark:border-zinc-900 flex justify-center">
             <button onClick={() => router.push('/')} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <BookOpen size={16} /> Return to Dashboard
             </button>
        </div>
      </main>
    </div>
  );
}
