"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Loader2, Layers, CheckCircle2, Download } from "lucide-react";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
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

  // Ref for the content we want to turn into a PDF
  const pdfRef = useRef();

  useEffect(() => {
    if (!id) return;
    async function fetchChapter() {
      try {
        const res = await fetch(`/api/chapters/${id}`);
        const data = await res.json();
        if (data.success) {
          setChapter(data.data);
        }
      } catch (error) {
        console.error("Error fetching chapter:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchChapter();
  }, [id]);

  // --- PDF Download Handler ---
  const handleDownloadPDF = async () => {
    if (!chapter) return;
    setDownloading(true);

    try {
        // Dynamic import to avoid SSR issues
        const html2pdf = (await import("html2pdf.js")).default;
        const element = pdfRef.current;

        const opt = {
          margin:       [0.5, 0.5, 0.5, 0.5],
          filename:     `${chapter.title.replace(/\s+/g, '_')}_Class${chapter.classLevel}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        // Generate PDF
        await html2pdf().set(opt).from(element).save();
    } catch (err) {
        console.error("PDF Generation failed", err);
        alert("Failed to generate PDF. Please try again.");
    } finally {
        setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 gap-3 transition-colors">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-600 dark:text-indigo-500" />
        <p className="text-xs uppercase tracking-widest animate-pulse">Loading Materials</p>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white flex items-center justify-center transition-colors">
        <p className="text-zinc-500">Chapter not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200 transition-colors">

      {/* --- Sticky Header --- */}
      <header className="fixed top-0 inset-x-0 z-40 border-b border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl transition-colors">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-semibold">
                        Class {chapter.classLevel}
                    </span>
                    <h1 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] sm:max-w-md">
                        {chapter.title}
                    </h1>
                </div>
            </div>

            {/* DOWNLOAD BUTTON */}
            <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded-full hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all disabled:opacity-50"
            >
                {downloading ? (
                    <Loader2 size={14} className="animate-spin" />
                ) : (
                    <Download size={14} />
                )}
                <span className="hidden sm:inline">{downloading ? "Generating..." : "Download PDF"}</span>
            </button>
        </div>
      </header>

      {/* --- Main Reading Area (On Screen) --- */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-20">

        {/* Title Section */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20 text-center max-w-3xl mx-auto"
        >
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-sm dark:shadow-none transition-colors">
                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 font-medium">
                    Chapter {chapter.chapterNumber}
                </span>
                {chapter.author && (
                    <>
                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                        <span className="text-zinc-600 dark:text-zinc-400 text-xs font-medium">
                            {chapter.author}
                        </span>
                    </>
                )}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-zinc-900 dark:text-white tracking-tight leading-[1.1]">
                {chapter.title}
            </h1>
        </motion.div>

        {/* Content Units Loop */}
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-24"
        >
            {chapter.units.map((unit, uIndex) => (
                <motion.div key={uIndex} variants={itemVariants} className="relative">

                    {/* Unit Header */}
                    <div className="flex items-center gap-4 mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 transition-colors">
                            <Layers size={20} />
                        </div>
                        <div>
                             <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                                Unit {uIndex + 1}
                             </span>
                             <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-none mt-1">
                                {unit.title}
                             </h2>
                        </div>
                    </div>

                    {/* Paragraphs List */}
                    <div className="space-y-6">
                        {unit.paragraphs.map((para, pIndex) => (
                            <div
                                key={pIndex}
                                className="group relative bg-white dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/40 transition-all duration-300 shadow-sm dark:shadow-none"
                            >
                                <div className="absolute top-4 left-4 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                    {pIndex + 1}
                                </div>
                                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-100 dark:divide-zinc-800/50">
                                    {/* English */}
                                    <div className="p-8 pt-12 md:pt-8 relative">
                                        <div className="absolute top-4 right-4 md:left-auto md:right-4 flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">English</span>
                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                        </div>
                                        <p className="text-lg md:text-xl text-zinc-900 dark:text-zinc-100 leading-relaxed font-serif max-w-prose">
                                            {para.english}
                                        </p>
                                    </div>
                                    {/* Bengali */}
                                    <div className="p-8 pt-12 md:pt-8 bg-zinc-50/50 dark:bg-black/20 relative transition-colors">
                                        <div className="absolute top-4 right-4 flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Bengali</span>
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                        </div>
                                        <p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed font-bengali max-w-prose">
                                            {para.bengali}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Activities Card */}
                    {unit.activities && unit.activities.length > 0 && (
                         <div className="mt-10 p-1 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800 transition-all">
                            <div className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-sm dark:shadow-none text-zinc-500 dark:text-zinc-400 transition-colors border border-zinc-200 dark:border-zinc-700">
                                        <CheckCircle2 size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Unit Activities</h3>
                                        <p className="text-zinc-500 text-sm mt-1 max-w-md">
                                            {unit.activities.length} practice exercises available.
                                        </p>
                                    </div>
                                </div>
                            </div>
                         </div>
                    )}
                </motion.div>
            ))}
        </motion.div>

        {/* Footer Navigation */}
        <div className="mt-32 pt-10 border-t border-zinc-200 dark:border-zinc-900 flex justify-center transition-colors">
             <button onClick={() => router.push('/')} className="group flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800 transition-colors">
                    <BookOpen size={16} />
                </div>
                <span>Return to Dashboard</span>
             </button>
        </div>

      </main>

      {/* ===================================================================================== */}
      {/* HIDDEN PDF TEMPLATE (Strict HEX Colors only)                                         */}
      {/* ===================================================================================== */}
      <div className="absolute top-0 left-0 w-full -z-50 opacity-0 pointer-events-none">
          <div ref={pdfRef} style={{ backgroundColor: '#ffffff', color: '#000000', padding: '40px', fontFamily: 'serif' }}>

              {/* PDF Title Page */}
              <div style={{ borderBottom: '2px solid #000000', paddingBottom: '30px', marginBottom: '30px', textAlign: 'center' }}>
                  <h1 style={{ fontSize: '32px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>
                    {chapter.title}
                  </h1>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', fontSize: '14px', fontFamily: 'monospace', color: '#555555' }}>
                      <span>Class {chapter.classLevel}</span>
                      <span>•</span>
                      <span>Chapter {chapter.chapterNumber}</span>
                      {chapter.author && (
                          <><span>•</span><span>{chapter.author}</span></>
                      )}
                  </div>
              </div>

              {/* PDF Content */}
              {chapter.units.map((unit, uIndex) => (
                  <div key={uIndex} style={{ marginBottom: '40px', pageBreakInside: 'avoid' }}>
                      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', borderBottom: '1px solid #cccccc', paddingBottom: '5px' }}>
                         Unit {uIndex + 1}: {unit.title}
                      </h2>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          {unit.paragraphs.map((para, pIndex) => (
                              <div key={pIndex} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '15px', border: '1px solid #e5e5e5', borderRadius: '8px', pageBreakInside: 'avoid' }}>
                                  <div style={{ borderRight: '1px solid #e5e5e5', paddingRight: '15px' }}>
                                      <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#111111', fontFamily: 'serif' }}>
                                        {para.english}
                                      </p>
                                  </div>
                                  <div>
                                      <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#333333', fontFamily: 'sans-serif' }}>
                                        {para.bengali}
                                      </p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              ))}

              <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eeeeee', textAlign: 'center', fontSize: '10px', color: '#999999' }}>
                  <p>Downloaded from EnglishMastery Platform</p>
              </div>
          </div>
      </div>

    </div>
  );
}
