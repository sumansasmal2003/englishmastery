"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shuffle, Loader2, ArrowRight, X } from "lucide-react";

export default function LexiconScramble({ onClose }) {
    const FALLBACK_WORDS = ["education", "learning", "student", "teacher", "library", "grammar"];
    const [currentWord, setCurrentWord] = useState("");
    const [scrambled, setScrambled] = useState("");
    const [input, setInput] = useState("");
    const [score, setScore] = useState(0);
    const [loadingWord, setLoadingWord] = useState(false);

    useEffect(() => { fetchNewWord(); }, []);

    const fetchNewWord = async () => {
        setLoadingWord(true); setInput("");
        try {
            const res = await fetch('https://random-word-api.herokuapp.com/word?number=1');
            const data = await res.json();
            const word = data[0] || FALLBACK_WORDS[0];
            setCurrentWord(word); setScrambled(word.split('').sort(() => Math.random() - 0.5).join(''));
        } catch (e) {
            const word = FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)];
            setCurrentWord(word); setScrambled(word.split('').sort(() => Math.random() - 0.5).join(''));
        } finally { setLoadingWord(false); }
    };

    const checkGuess = (e) => {
        e.preventDefault();
        if (input.toLowerCase().trim() === currentWord.toLowerCase()) {
            setScore(s => s + 1); fetchNewWord();
        } else {
             const el = document.getElementById('scr-inp');
             el.classList.add('animate-shake', 'border-red-500');
             setTimeout(() => el.classList.remove('animate-shake', 'border-red-500'), 500);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-blue-900/30 rounded-3xl shadow-2xl overflow-hidden relative">
                <div className="p-4 flex justify-between items-center bg-blue-50/50 dark:bg-blue-900/10">
                    <div className="flex items-center gap-2 font-black text-blue-600 dark:text-blue-400 text-lg tracking-tight">
                        <Shuffle size={20} /> LEXICON SCRAMBLE
                    </div>
                    <button onClick={onClose}><X className="text-zinc-400 hover:text-black dark:hover:text-white" /></button>
                </div>

                <div className="p-8 min-h-[400px] flex flex-col items-center justify-center">
                    <div className="w-full space-y-8 text-center">
                        <div className="flex flex-col items-center">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Words Solved</span>
                            <span className="text-4xl font-black text-blue-600 dark:text-blue-400">{score}</span>
                        </div>

                        <div className="py-6 flex flex-wrap gap-2 justify-center min-h-[100px] items-center">
                            {loadingWord ? <Loader2 className="w-8 h-8 animate-spin text-blue-500"/> : scrambled.split('').map((char, i) => (
                                <motion.div key={i} initial={{scale:0}} animate={{scale:1}} transition={{delay: i*0.05}} className="w-10 h-12 bg-white dark:bg-zinc-800 border-b-4 border-zinc-200 dark:border-zinc-700 rounded-lg flex items-center justify-center text-xl font-black text-zinc-800 dark:text-white shadow-sm uppercase select-none">
                                    {char}
                                </motion.div>
                            ))}
                        </div>

                        <form onSubmit={checkGuess} className="relative max-w-xs mx-auto">
                            <input id="scr-inp" autoFocus type="text" value={input} onChange={(e) => setInput(e.target.value)}
                                className="w-full px-6 py-4 bg-zinc-100 dark:bg-zinc-900 border-2 border-transparent rounded-2xl focus:border-blue-500 outline-none text-center font-bold text-xl uppercase tracking-widest transition-all" placeholder="TYPE HERE" disabled={loadingWord} />
                            <button type="submit" className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"><ArrowRight size={20}/></button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
