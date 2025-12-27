"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link as LinkIcon, X, ArrowUp, Zap } from "lucide-react";

export default function WordChainGame({ onClose }) {
    const [chain, setChain] = useState([]);
    const [input, setInput] = useState("");
    const [turn, setTurn] = useState("USER");
    const [aiLoading, setAiLoading] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState("Start the chain!");
    const listRef = useRef(null);
    const gameOverRef = useRef(false);
    const [turnTimer, setTurnTimer] = useState(10);

    // Auto-scroll
    useEffect(() => { if(listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [chain]);

    // Timer Logic
    useEffect(() => {
        if (gameOver) return;
        setTurnTimer(10);
        const timerId = setInterval(() => {
            setTurnTimer(prev => {
                if (prev <= 1) { clearInterval(timerId); handleTimeout(); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerId);
    }, [turn, gameOver]);

    const handleTimeout = () => {
        setGameOver(true); gameOverRef.current = true;
        setMessage(turn === 'USER' ? "⏰ Time's up! I win!" : "⏰ I timed out! You win!");
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        if (gameOver || turn !== 'USER') return;
        const word = input.trim();
        if (!word) return;

        if (chain.length > 0) {
            const lastWord = chain[chain.length - 1];
            if (word.toLowerCase()[0] !== lastWord.toLowerCase().slice(-1)) { setMessage(`Must start with '${lastWord.slice(-1).toUpperCase()}'!`); return; }
        }
        if (chain.some(w => w.toLowerCase() === word.toLowerCase())) { setMessage("Already used!"); return; }

        const newChain = [...chain, word];
        setChain(newChain); setInput(""); setTurn("AI"); setMessage("Thinking...");
        await playAiTurn(word, newChain);
    };

    const playAiTurn = async (lastWord, currentHistory) => {
        setAiLoading(true);
        try {
            const res = await fetch('/api/ai', { method: 'POST', body: JSON.stringify({ action: 'generate_game_content', gameType: 'WORD_CHAIN', lastWord, history: currentHistory }) });
            const data = await res.json();
            if (gameOverRef.current) return;
            if (data.userLost || data.aiLost || !data.word) {
                 setGameOver(true); gameOverRef.current = true;
                 setMessage(data.userLost ? `❌ "${lastWord}" isn't a word! I win!` : "🤯 I give up! You win!");
            } else {
                setChain(prev => [...prev, data.word]); setTurn("USER"); setMessage("Your turn!");
            }
        } catch (e) { if (!gameOverRef.current) { setMessage("Network error. Retry."); setTurn("USER"); } } finally { setAiLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col h-[600px] overflow-hidden">
                <div className="bg-zinc-50 dark:bg-zinc-900 p-4 flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white"><LinkIcon className="text-emerald-500" size={20}/> Word Chain</div>
                    <button onClick={onClose} className="bg-white dark:bg-zinc-800 p-2 rounded-full shadow-sm hover:scale-110 transition-transform"><X size={16}/></button>
                </div>

                {/* Game Body */}
                <div className="flex-1 flex flex-col relative bg-white dark:bg-black">
                    <div className="absolute top-0 inset-x-0 h-1 bg-zinc-100 dark:bg-zinc-800 z-10">
                        <motion.div key={turn} initial={{ width: "100%" }} animate={{ width: "0%" }} transition={{ duration: 10, ease: "linear" }} className={`h-full ${turn === 'USER' ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                    </div>

                    <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {chain.length === 0 && <div className="text-center text-zinc-400 mt-20 font-medium">Type a word to start<br/>the infinite chain!</div>}
                        {chain.map((word, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                                <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm font-bold shadow-sm ${i % 2 === 0 ? 'bg-emerald-500 text-white rounded-tr-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-sm'}`}>
                                    {word}
                                </div>
                            </motion.div>
                        ))}
                        {aiLoading && <div className="flex justify-start"><div className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm flex gap-1"><span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"/><span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-75"/><span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-150"/></div></div>}
                    </div>

                    <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                        <div className={`text-center text-xs font-bold mb-3 ${gameOver ? 'text-red-500' : 'text-zinc-400'}`}>{message}</div>
                        <form onSubmit={handleUserSubmit} className="relative flex items-center gap-2">
                            <input autoFocus disabled={turn !== 'USER' || gameOver} type="text" placeholder={turn==='USER' ? "Type word..." : "AI thinking..."} value={input} onChange={(e) => setInput(e.target.value)}
                                className="flex-1 bg-white dark:bg-zinc-800 border-none rounded-full px-5 py-3 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium disabled:opacity-50" />
                            <button disabled={turn !== 'USER' || gameOver} type="submit" className="p-3 bg-emerald-500 text-white rounded-full shadow-lg hover:scale-105 active:scale-95 disabled:bg-zinc-300 disabled:scale-100 transition-all"><ArrowUp size={20}/></button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
