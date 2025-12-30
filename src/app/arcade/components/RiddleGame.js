"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Loader2, RefreshCcw, Lightbulb, Eye, X, ArrowRight, HelpCircle } from "lucide-react";

export default function RiddleGame({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [guess, setGuess] = useState("");
  const [status, setStatus] = useState("START"); // START, PLAYING, WON, REVEALED
  const [showHint, setShowHint] = useState(false);

  const fetchRiddle = async () => {
    setLoading(true); setStatus("PLAYING"); setData(null); setGuess(""); setShowHint(false);
    try {
      const res = await fetch('/api/ai', { method: 'POST', body: JSON.stringify({ action: 'generate_game_content', gameType: 'RIDDLE', difficulty: 'Medium' }) });
      setData(await res.json());
    } catch (e) { onClose(); } finally { setLoading(false); }
  };

  if (status === "START") fetchRiddle();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"><X size={18}/></button>

        <div className="p-8 flex flex-col items-center text-center min-h-[400px]">
            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-purple-400">
                <BrainCircuit size={32} />
            </div>

            {loading ? (
                 <div className="flex flex-col items-center gap-4 mt-8">
                     <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                     <p className="text-zinc-500 font-medium">Consulting the Oracle...</p>
                 </div>
            ) : status === "WON" || status === "REVEALED" ? (
                <div className="space-y-6 mt-4">
                     <h2 className={`text-3xl font-black ${status === 'WON' ? 'text-green-400' : 'text-amber-400'}`}>
                         {status === 'WON' ? "You Cracked It!" : "The Answer Is..."}
                     </h2>
                     <div className="p-6 bg-zinc-800/50 rounded-xl border border-zinc-700">
                         <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-2">Solution</p>
                         <p className="text-2xl font-bold text-white tracking-wide">{data?.answer}</p>
                     </div>
                     <button onClick={fetchRiddle} className="px-8 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
                        <RefreshCcw size={18} /> Next Riddle
                     </button>
                </div>
            ) : data ? (
                <div className="w-full space-y-6">
                    <div className="flex justify-center items-center text-xs font-bold uppercase tracking-widest text-zinc-500 gap-2">
                        <BrainCircuit size={14}/> <span>Zen Mode</span>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xl md:text-2xl font-medium text-zinc-100 leading-relaxed font-serif italic">
                            "{data.question}"
                        </h3>
                        {/* Bengali Translation */}
                        {data.questionBn && (
                            <p className="text-lg text-zinc-400 leading-relaxed font-serif">
                                {data.questionBn}
                            </p>
                        )}
                    </div>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (guess.toLowerCase().includes(data.answer.toLowerCase())) setStatus("WON");
                        else { const el = document.getElementById('inp'); el.classList.add('border-red-500'); setTimeout(()=>el.classList.remove('border-red-500'),500); }
                    }} className="relative">
                        <input id="inp" autoFocus type="text" placeholder="Type your answer..." value={guess} onChange={(e) => setGuess(e.target.value)}
                            className="w-full px-5 py-4 bg-zinc-800 border-2 border-zinc-700 rounded-xl focus:border-purple-500 outline-none text-center font-bold text-lg text-white transition-all placeholder:text-zinc-600" />
                        <button type="submit" className="absolute right-2 top-2 bottom-2 aspect-square bg-purple-600 rounded-lg flex items-center justify-center hover:bg-purple-500 transition-colors"><ArrowRight size={20} className="text-white"/></button>
                    </form>

                    <div className="flex justify-center gap-3">
                        <button onClick={() => setShowHint(true)} className="px-4 py-2 rounded-lg bg-zinc-800 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors flex items-center gap-2">
                            <Lightbulb size={14} className={showHint ? "text-yellow-400" : ""}/> {showHint ? data.hint : "Hint"}
                        </button>
                        <button onClick={() => setStatus("REVEALED")} className="px-4 py-2 rounded-lg bg-zinc-800 text-xs font-bold text-zinc-400 hover:text-amber-400 hover:bg-zinc-700 transition-colors flex items-center gap-2">
                            <HelpCircle size={14}/> Give Up
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
      </motion.div>
    </div>
  );
}
