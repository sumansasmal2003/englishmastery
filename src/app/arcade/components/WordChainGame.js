"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link as LinkIcon, X, ArrowUp, Loader2, Hourglass, AlertCircle } from "lucide-react";

export default function WordChainGame({ onClose }) {
    const [chain, setChain] = useState([]);
    const [input, setInput] = useState("");
    const [turn, setTurn] = useState("USER"); // USER, CPU
    const [loading, setLoading] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState("Type a word to start!");
    const [timeLeft, setTimeLeft] = useState(15);

    const listRef = useRef(null);
    const gameOverRef = useRef(false); // Ref to track game over inside timers

    // Auto-scroll to bottom
    useEffect(() => {
        if(listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [chain]);

    // --- TIMER LOGIC ---
    useEffect(() => {
        if (gameOver) return;

        // Reset timer on turn change
        setTimeLeft(15);

        const timerId = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerId);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [turn, gameOver]);

    // Check for Timeout
    useEffect(() => {
        if (timeLeft === 0 && !gameOver) {
            handleTimeout();
        }
    }, [timeLeft, gameOver]);

    const handleTimeout = () => {
        setGameOver(true);
        gameOverRef.current = true;
        setLoading(false);
        if (turn === 'USER') {
            setMessage("⏰ Time's up! You took too long.");
        } else {
            setMessage("⏰ CPU timed out! You win! 🏆");
        }
    };

    // --- GAME LOGIC ---

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        if (gameOver || turn !== 'USER' || loading) return;

        const word = input.trim().toLowerCase();
        if (!word) return;

        // 1. Check Local Rules
        if (chain.length > 0) {
            const lastWord = chain[chain.length - 1];
            if (word[0] !== lastWord.slice(-1)) {
                setMessage(`❌ Must start with '${lastWord.slice(-1).toUpperCase()}'!`);
                return;
            }
        }
        if (chain.some(w => w.toLowerCase() === word)) {
            setMessage("❌ Word already used!");
            return;
        }

        // 2. Verify with Dictionary API
        setLoading(true);
        setMessage("Verifying word...");

        try {
            const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            if (res.status === 404) {
                setMessage(`❌ "${word}" isn't in the dictionary!`);
                setLoading(false);
                return;
            }
        } catch (err) {
            // If API fails, we might optionally let it slide, but let's be strict for now or show error
            console.error(err);
        }

        // 3. Move Successful
        const newChain = [...chain, word];
        setChain(newChain);
        setInput("");
        setTurn("CPU");
        setMessage("Opponent is thinking...");

        await playCpuTurn(word, newChain);
    };

    const playCpuTurn = async (lastWord, currentHistory) => {
        // CPU logic runs...
        const lastChar = lastWord.slice(-1);

        try {
            // Get words starting with last char
            const res = await fetch(`https://api.datamuse.com/words?sp=${lastChar}*&max=50`);
            const data = await res.json();

            // Valid candidates (no history, letters only, min length)
            const candidates = data.filter(item =>
                !currentHistory.includes(item.word) &&
                /^[a-z]+$/.test(item.word) &&
                item.word.length > 2
            );

            if (gameOverRef.current) return; // Stop if timeout happened during fetch

            if (candidates.length === 0) {
                setGameOver(true);
                gameOverRef.current = true;
                setMessage("🤯 I give up! You win!");
                setLoading(false);
                return;
            }

            // Pick random word
            const choice = candidates[Math.floor(Math.random() * candidates.length)].word;

            // Artificial delay for realism (ensure it doesn't exceed timer)
            setTimeout(() => {
                if (gameOverRef.current) return;
                setChain(prev => [...prev, choice]);
                setTurn("USER");
                setMessage("Your turn!");
                setLoading(false);
            }, 1000 + Math.random() * 1000);

        } catch (e) {
            if (!gameOverRef.current) {
                setMessage("Network error. Try again.");
                setLoading(false); // Allow user to try again? Or stick?
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            {/* UI Fix: Use h-[80vh] instead of fixed pixels to fit better on screens */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col h-[80vh] overflow-hidden relative"
            >
                {/* Header */}
                <div className="bg-zinc-50 dark:bg-zinc-900 p-4 flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 z-30">
                    <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
                        <LinkIcon className="text-emerald-500" size={20}/> Word Chain
                    </div>
                    <button onClick={onClose} className="bg-white dark:bg-zinc-800 p-2 rounded-full shadow-sm hover:scale-110 transition-transform">
                        <X size={16}/>
                    </button>
                </div>

                {/* Progress Bar (Timer Visual) */}
                {!gameOver && (
                    <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 w-full relative z-30">
                        <motion.div
                            key={turn} // Reset animation on turn change
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 15, ease: "linear" }}
                            className={`h-full ${turn === 'USER' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        />
                    </div>
                )}

                {/* Info Bar */}
                <div className="bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur px-4 py-2 flex justify-between items-center text-xs font-bold border-b border-zinc-100 dark:border-zinc-800 z-30">
                    <span className={turn === 'USER' ? "text-emerald-600 animate-pulse" : "text-zinc-400"}>YOU</span>
                    <div className={`flex items-center gap-1 ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`}>
                        <Hourglass size={12}/> {timeLeft}s
                    </div>
                    <span className={turn === 'CPU' ? "text-amber-500 animate-pulse" : "text-zinc-400"}>CPU</span>
                </div>

                {/* List Container */}
                <div className="flex-1 overflow-hidden relative bg-white dark:bg-black">
                    <div ref={listRef} className="absolute inset-0 overflow-y-auto p-4 space-y-3 custom-scrollbar pb-24">
                        {chain.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-400 font-medium opacity-60">
                                <LinkIcon size={48} className="mb-4 text-emerald-200 dark:text-emerald-900"/>
                                <p>Type a word to start<br/>the chain!</p>
                            </div>
                        )}

                        {chain.map((word, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm font-bold shadow-sm ${
                                    i % 2 === 0
                                        ? 'bg-emerald-500 text-white rounded-tr-sm'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-sm'
                                }`}>
                                    {word}
                                </div>
                            </motion.div>
                        ))}

                        {loading && turn === 'CPU' && (
                            <div className="flex justify-start">
                                <div className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"/>
                                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-75"/>
                                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-150"/>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Area - Z-Index Fix to stay on top */}
                <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-40 relative">
                    <div className={`text-center text-xs font-bold mb-3 flex items-center justify-center gap-2 h-5 ${gameOver ? 'text-red-500' : 'text-zinc-400'}`}>
                        {message}
                    </div>

                    <form onSubmit={handleUserSubmit} className="relative flex items-center gap-2">
                        <input
                            autoFocus
                            disabled={turn !== 'USER' || gameOver || loading}
                            type="text"
                            placeholder={turn === 'USER' && chain.length > 0 ? `Starts with ${chain[chain.length-1].slice(-1).toUpperCase()}...` : "Type word..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-zinc-700 rounded-full px-5 py-3 shadow-inner focus:ring-2 focus:ring-emerald-500 outline-none font-medium disabled:opacity-50 text-zinc-900 dark:text-white transition-all"
                        />
                        <button
                            disabled={turn !== 'USER' || gameOver || loading}
                            type="submit"
                            className="p-3 bg-emerald-500 text-white rounded-full shadow-lg hover:scale-105 active:scale-95 disabled:bg-zinc-300 disabled:scale-100 transition-all flex-shrink-0"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin"/> : <ArrowUp size={20}/>}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
