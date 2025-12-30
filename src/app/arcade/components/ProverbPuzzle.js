"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListOrdered, Loader2, CheckCircle2, X, Undo2, Quote, ArrowRight } from "lucide-react";

export default function ProverbPuzzle({ onClose }) {
    const FALLBACK_PROVERBS = ["Actions speak louder than words", "Better late than never", "Practice makes perfect"];
    const [loading, setLoading] = useState(true);
    const [targetPhrase, setTargetPhrase] = useState([]);
    const [scrambledWords, setScrambledWords] = useState([]);
    const [selectedWords, setSelectedWords] = useState([]);
    const [isCorrect, setIsCorrect] = useState(false);
    const [author, setAuthor] = useState("");

    useEffect(() => { fetchProverb(); }, []);

    const fetchProverb = async () => {
        setLoading(true); setIsCorrect(false); setSelectedWords([]); setAuthor("");
        try {
            const res = await fetch('https://dummyjson.com/quotes/random');
            const data = await res.json();
            if (data?.quote && data.quote.split(' ').length <= 15) setupGame(data.quote, data.author);
            else setupGame(FALLBACK_PROVERBS[0], "Traditional");
        } catch (e) { setupGame(FALLBACK_PROVERBS[0], "Traditional"); }
        finally { setLoading(false); }
    };

    const setupGame = (phrase, authorName) => {
        const words = phrase.split(' '); setTargetPhrase(words); setAuthor(authorName);
        setScrambledWords([...words].sort(() => Math.random() - 0.5));
    };

    const handleWordClick = (word, index) => {
        if (isCorrect) return;
        const newSelected = [...selectedWords, word];
        setSelectedWords(newSelected);
        const newScrambled = [...scrambledWords];
        newScrambled.splice(index, 1);
        setScrambledWords(newScrambled);

        if (newScrambled.length === 0) {
            if (newSelected.join(' ') === targetPhrase.join(' ')) setIsCorrect(true);
            else setTimeout(() => { setSelectedWords([]); setScrambledWords([...targetPhrase].sort(() => Math.random() - 0.5)); }, 800);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl bg-orange-50 dark:bg-[#1c1917] border border-orange-200 dark:border-orange-900 rounded-3xl shadow-2xl overflow-hidden relative">
                <div className="p-4 flex justify-between items-center bg-orange-100 dark:bg-orange-900/20">
                    <div className="flex items-center gap-2 font-bold text-orange-700 dark:text-orange-500"><ListOrdered size={20}/> PROVERB PUZZLE</div>
                    <button onClick={onClose}><X className="text-zinc-400 hover:text-black dark:hover:text-white" /></button>
                </div>

                <div className="p-8 min-h-[400px] flex flex-col">
                    {loading ? <div className="m-auto flex flex-col items-center"><Loader2 className="animate-spin text-orange-500 mb-2"/><p className="text-zinc-400">Finding wisdom...</p></div> : (
                        <>
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-200/50 dark:bg-orange-900/30 text-xs font-bold text-orange-800 dark:text-orange-400 uppercase tracking-wide">
                                    <Quote size={10}/> {author || "Unknown"}
                                </div>
                            </div>

                            <div className={`min-h-[120px] p-6 rounded-2xl border-2 flex flex-wrap gap-2 justify-center items-center transition-all ${isCorrect ? 'bg-green-100 border-green-300 dark:bg-green-900/20 dark:border-green-800' : 'bg-white dark:bg-zinc-900 border-dashed border-zinc-300 dark:border-zinc-800'}`}>
                                <AnimatePresence>
                                    {selectedWords.length === 0 && !isCorrect && <span className="text-zinc-400 italic text-sm select-none">Tap words to build the quote...</span>}
                                    {selectedWords.map((w, i) => (
                                        <motion.span layout key={`${w}-${i}`} initial={{scale:0}} animate={{scale:1}} className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded shadow-sm text-sm font-bold text-zinc-800 dark:text-zinc-200 cursor-default">
                                            {w}
                                        </motion.span>
                                    ))}
                                </AnimatePresence>
                            </div>

                            <div className="flex-1 mt-8">
                                {isCorrect ? (
                                    <div className="text-center animate-in zoom-in duration-300">
                                        <div className="text-green-600 font-black text-2xl flex items-center justify-center gap-2 mb-4"><CheckCircle2 /> Perfect!</div>
                                        <button onClick={fetchProverb} className="px-8 py-3 bg-orange-600 text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
                                            Next Quote <ArrowRight size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-3 justify-center">
                                        {scrambledWords.map((word, i) => (
                                            <motion.button layout key={`${word}-${i}`} onClick={() => handleWordClick(word, i)} whileHover={{y:-2}} whileTap={{scale:0.9}} className="px-4 py-2 bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-800/50 rounded-lg font-bold text-sm shadow-sm hover:shadow-md transition-all">
                                                {word}
                                            </motion.button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {!isCorrect && <div className="flex justify-center mt-6">
                                <button onClick={()=> { if(selectedWords.length>0){ const last=selectedWords[selectedWords.length-1]; setSelectedWords(selectedWords.slice(0,-1)); setScrambledWords([...scrambledWords, last]); }}}
                                    disabled={selectedWords.length === 0} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center gap-1 text-xs font-bold disabled:opacity-30">
                                    <Undo2 size={14}/> UNDO
                                </button>
                            </div>}
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
