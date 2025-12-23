"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, BookOpen, Loader2, PenTool, Lightbulb, Sparkles,
  BrainCircuit, CheckCircle2, XCircle, Trophy, Download, ImageIcon, Calendar, UserCircle2
} from "lucide-react";

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

export default function GrammarDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  // Download State
  const [downloading, setDownloading] = useState(false);
  const pdfRef = useRef();

  // Quiz State
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function fetchTopic() {
      try {
        const res = await fetch(`/api/grammar/${id}`);
        const data = await res.json();
        if (data.success) {
            setTopic(data.data);
            document.title = `${data.data.topic} | Grammar Reference`; // Dynamic Title
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTopic();
  }, [id]);

  // --- PDF DOWNLOAD HANDLER ---
  const handleDownloadPDF = async () => {
    if (!topic) return;
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = pdfRef.current;
      const opt = {
        margin:       [0.75, 0.75, 0.75, 0.75], // Standard book margins (0.75 inch)
        filename:     `${topic.topic.replace(/\s+/g, '_')}_Grammar_Guide.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] } // Avoid cutting elements
      };
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF Failed", err);
      alert("Could not generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setGeneratingQuiz(true);
    try {
      const res = await fetch(`/api/grammar/${id}/quiz`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setQuizData(data.data);
        setIsQuizOpen(true);
      } else {
        alert("Failed to generate quiz. Please try again.");
      }
    } catch (error) {
      console.error("Quiz Gen Error", error);
      alert("Error connecting to AI.");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#050505] flex flex-col items-center justify-center text-zinc-400 gap-3">
        <Loader2 className="animate-spin w-8 h-8 text-emerald-600" />
        <p className="text-xs uppercase tracking-widest animate-pulse">Loading Grammar Rules</p>
      </div>
    );
  }

  if (!topic) return <div className="min-h-screen bg-white dark:bg-[#050505] flex items-center justify-center text-zinc-500">Topic not found.</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-zinc-900 dark:text-zinc-200 font-sans selection:bg-emerald-500/30 relative">

      {/* --- BACKGROUND GRID --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#ffffff00,white)] dark:bg-[radial-gradient(circle_800px_at_50%_200px,#00000000,#050505)]"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-40 border-b border-zinc-200/50 dark:border-white/5 bg-white/60 dark:bg-black/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors">
                    <ArrowLeft size={18} />
                </button>
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <Sparkles size={10} /> Grammar Reference
                    </span>
                    <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">{topic.topic}</h1>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* DOWNLOAD PDF BUTTON */}
                <button
                    onClick={handleDownloadPDF}
                    disabled={downloading}
                    className="flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all disabled:opacity-50"
                >
                    {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    <span className="hidden sm:inline">{downloading ? "PDF..." : "Download"}</span>
                </button>

                {/* AI QUIZ BUTTON */}
                <button
                    onClick={handleGenerateQuiz}
                    disabled={generatingQuiz}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold rounded-full hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {generatingQuiz ? <Loader2 size={14} className="animate-spin" /> : <BrainCircuit size={14} />}
                    <p className="hidden md:block">{generatingQuiz ? "Generating..." : "Practice with AI"}</p>
                </button>
            </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-20">

        {/* --- DYNAMIC HERO SECTION --- */}
        {topic.coverImage ? (
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full h-[100vh] min-h-full rounded-[2rem] overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 group mb-24"
            >
                {/* Professional Lazy Loaded Hero Image - CHANGED to object-cover */}
                <ProfessionalImage
                    src={topic.coverImage}
                    alt={topic.topic}
                    priority={true}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] ease-linear group-hover:scale-110"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 pointer-events-none"></div>

                {/* Content Positioned Bottom-Left */}
                <div className="absolute bottom-0 left-0 p-8 md:p-14 w-full max-w-4xl space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap items-center gap-3"
                    >
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                            Grammar
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                        <span className="text-zinc-300 text-xs font-medium uppercase tracking-wider">Reference</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] drop-shadow-lg"
                    >
                        {topic.topic}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-lg text-zinc-300 max-w-2xl leading-relaxed"
                    >
                        {topic.description}
                    </motion.p>
                </div>
            </motion.div>
        ) : (
            // Fallback Title Card
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-24 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400 mb-6 shadow-sm border border-emerald-100 dark:border-emerald-500/20">
                    <PenTool size={24} />
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-6 leading-tight">{topic.topic}</h1>
                {topic.description && <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">{topic.description}</p>}
            </motion.div>
        )}

        {/* Sections Loop */}
        <div className="space-y-16">
            {topic.sections.map((sec, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: idx * 0.1 }}
                    className="group bg-white/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-500/20 transition-all backdrop-blur-sm"
                >
                    {/* Rule Header */}
                    <div className="p-8 md:p-10 border-b border-zinc-100 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/60">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md text-[10px] font-bold text-zinc-500 uppercase tracking-widest border border-zinc-200 dark:border-zinc-700">Rule {idx + 1}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">{sec.title}</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-base md:text-lg">{sec.content}</p>
                    </div>

                    {/* Examples Area */}
                    {sec.examples.length > 0 && (
                        <div className="p-8 md:p-10 bg-zinc-50/50 dark:bg-black/20">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Lightbulb size={14} className="text-amber-500 fill-amber-500" /> Examples
                            </h3>
                            <div className="grid gap-4">
                                {sec.examples.map((ex, exIdx) => (
                                    <div key={exIdx} className="relative p-5 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-xl hover:border-emerald-200 dark:hover:border-emerald-900 transition-colors">
                                        <div className="absolute left-0 top-6 w-1 h-8 bg-emerald-500 rounded-r-full"></div>
                                        <div className="pl-4">
                                            <p className="text-lg font-medium text-zinc-800 dark:text-zinc-200 font-serif leading-snug mb-2">"{ex.sentence}"</p>
                                            {ex.explanation && (
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-2 mt-2">{ex.explanation}</p>
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
             <button onClick={() => router.push('/')} className="group flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors px-6 py-3 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900">
                <BookOpen size={16} className="group-hover:-translate-x-1 transition-transform" /> Return to Dashboard
             </button>
        </div>

      </main>

      {/* --- AI QUIZ MODAL --- */}
      <AnimatePresence>
        {isQuizOpen && quizData && (
           <QuizInterface questions={quizData} onClose={() => setIsQuizOpen(false)} />
        )}
      </AnimatePresence>

      {/* --- HIDDEN PDF BOOK TEMPLATE --- */}
      <div className="absolute top-0 left-0 w-full -z-50 opacity-0 pointer-events-none">
        <div
            ref={pdfRef}
            style={{
                backgroundColor: '#ffffff',
                color: '#1a1a1a',
                fontFamily: '"Georgia", "Times New Roman", serif',
                fontSize: '12pt',
                lineHeight: '1.6'
            }}
        >
            {/* Title Page */}
            <div style={{
                height: '11.69in', // Approximate A4 Height
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                pageBreakAfter: 'always',
                padding: '0 50px'
            }}>
                <h1 style={{ fontSize: '36pt', fontWeight: 'bold', marginBottom: '20px', letterSpacing: '-0.02em' }}>{topic.topic}</h1>
                <div style={{ width: '60px', height: '4px', backgroundColor: '#000', marginBottom: '30px' }}></div>
                <p style={{ fontSize: '16pt', color: '#555', fontStyle: 'italic', maxWidth: '80%' }}>{topic.description}</p>

                <div style={{ marginTop: 'auto', marginBottom: '50px', fontSize: '10pt', color: '#888', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    EnglishMastery Grammar Series
                </div>
            </div>

            {/* Content Pages */}
            <div style={{ padding: '50px' }}>
                {topic.sections.map((sec, idx) => (
                    <div key={idx} style={{ marginBottom: '40px', pageBreakInside: 'avoid' }}>
                        {/* Rule Header */}
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{
                                display: 'inline-block',
                                fontSize: '9pt',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                border: '1px solid #333',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                marginBottom: '8px'
                            }}>
                                Rule {idx + 1}
                            </div>
                            <h2 style={{ fontSize: '18pt', fontWeight: 'bold', margin: '0 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                {sec.title}
                            </h2>
                        </div>

                        {/* Rule Content */}
                        <p style={{ textAlign: 'justify', marginBottom: '20px', color: '#333' }}>
                            {sec.content}
                        </p>

                        {/* Examples Box */}
                        {sec.examples.length > 0 && (
                            <div style={{
                                backgroundColor: '#f5f5f5',
                                padding: '20px',
                                borderRadius: '4px',
                                borderLeft: '4px solid #444'
                            }}>
                                <p style={{ fontSize: '10pt', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 10px 0', color: '#666', letterSpacing: '1px' }}>Examples</p>
                                {sec.examples.map((ex, exIdx) => (
                                    <div key={exIdx} style={{ marginBottom: '12px' }}>
                                        <p style={{ fontSize: '12pt', fontWeight: 'bold', fontStyle: 'italic', margin: '0 0 4px 0', color: '#000' }}>
                                            "{ex.sentence}"
                                        </p>
                                        {ex.explanation && (
                                            <p style={{ fontSize: '10pt', color: '#555', margin: 0, paddingLeft: '10px', borderLeft: '1px solid #ccc' }}>
                                                {ex.explanation}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer on last page */}
            <div style={{ textAlign: 'center', fontSize: '9pt', color: '#999', marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                Generated by EnglishMastery Learning Platform
            </div>
        </div>
      </div>

    </div>
  );
}

// --- SUB-COMPONENT: Interactive Quiz Interface ---
function QuizInterface({ questions, onClose }) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);

    const question = questions[currentIdx];

    const handleAnswer = (option) => {
        if (isAnswered) return;
        setSelectedOption(option);
        setIsAnswered(true);
        if (option === question.correctAnswer) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentIdx + 1 < questions.length) {
            setCurrentIdx(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResults(true);
        }
    };

    if (showResults) {
        return (
            <div className="fixed inset-0 z-[60] bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-8 text-center border border-zinc-200 dark:border-zinc-800 shadow-2xl">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400">
                        <Trophy size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Quiz Complete!</h2>
                    <p className="text-zinc-500 mb-8">You scored <span className="text-emerald-600 font-bold">{score}</span> out of <span className="text-zinc-900 dark:text-white font-bold">{questions.length}</span></p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={onClose} className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Close</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[60] bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[85vh]"
            >
                {/* Quiz Header */}
                <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Question {currentIdx + 1} of {questions.length}</span>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500"><XCircle size={20}/></button>
                </div>

                {/* Question Body */}
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                    <h3 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white mb-8 leading-snug">{question.question}</h3>

                    <div className="grid gap-3">
                        {question.options.map((opt, i) => {
                            let style = "border-zinc-200 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10";
                            let icon = null;

                            if (isAnswered) {
                                if (opt === question.correctAnswer) {
                                    style = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400";
                                    icon = <CheckCircle2 size={18}/>;
                                } else if (opt === selectedOption) {
                                    style = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400";
                                    icon = <XCircle size={18}/>;
                                } else {
                                    style = "opacity-50 border-zinc-200 dark:border-zinc-800";
                                }
                            } else if (selectedOption === opt) {
                                style = "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20";
                            }

                            return (
                                <button
                                    key={i}
                                    onClick={() => handleAnswer(opt)}
                                    disabled={isAnswered}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ${style}`}
                                >
                                    <span className="font-medium text-sm md:text-base">{opt}</span>
                                    {icon}
                                </button>
                            );
                        })}
                    </div>

                    {/* Explanation Reveal */}
                    {isAnswered && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-zinc-50 dark:bg-black/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
                            <p className="text-xs font-bold text-zinc-400 uppercase mb-1">Explanation</p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-300">{question.explanation}</p>
                        </motion.div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                    <button
                        onClick={handleNext}
                        disabled={!isAnswered}
                        className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                    >
                        {currentIdx + 1 === questions.length ? "Finish" : "Next Question"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
