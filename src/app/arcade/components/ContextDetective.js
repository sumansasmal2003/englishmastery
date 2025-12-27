"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, RefreshCcw, Lightbulb, Eye, CheckCircle2, X, ArrowRight } from "lucide-react";

export default function ContextDetective({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [guess, setGuess] = useState("");
  const [status, setStatus] = useState("START"); // START, PLAYING, WON
  const [showHint, setShowHint] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const fetchCase = async () => {
    setLoading(true); setStatus("PLAYING"); setData(null); setGuess(""); setShowHint(false); setRevealed(false);
    try {
      const res = await fetch('/api/ai', { method: 'POST', body: JSON.stringify({ action: 'generate_game_content', gameType: 'DETECTIVE', difficulty: 'Medium' }) });
      setData(await res.json());
    } catch (e) { onClose(); } finally { setLoading(false); }
  };

  if (status === "START") fetchCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg bg-[#1a1a1a] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
         <div className="bg-zinc-900/50 p-4 border-b border-zinc-800 flex justify-between items-center">
            <div className="flex items-center gap-2 text-amber-500">
                <Search size={18} />
                <span className="font-bold text-sm tracking-widest uppercase">Case File #{(Math.random()*1000).toFixed(0)}</span>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={18}/></button>
         </div>

         <div className="p-8 min-h-[350px] flex flex-col justify-center text-center">
            {loading ? (
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
                    <p className="font-mono text-sm text-amber-500/50 blink">DECRYPTING...</p>
                </div>
            ) : status === "WON" ? (
                <div className="space-y-6">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${revealed ? 'bg-zinc-800 text-zinc-500' : 'bg-green-500/20 text-green-500'}`}>
                        {revealed ? <Eye size={40}/> : <CheckCircle2 size={40} />}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{revealed ? "Case Closed" : "Mystery Solved!"}</h2>
                        <p className="text-zinc-400">Missing Link: <span className="text-amber-500 font-bold">{data.answer}</span></p>
                    </div>
                    <button onClick={fetchCase} className="px-6 py-2 bg-amber-500 text-black font-bold rounded hover:bg-amber-400 transition-colors inline-flex items-center gap-2">
                        <RefreshCcw size={16}/> Next Case
                    </button>
                </div>
            ) : data ? (
                <div className="space-y-8">
                     <div className="bg-black/40 p-6 rounded-lg border border-zinc-800/50 relative">
                        <div className="absolute top-0 left-0 px-2 py-1 bg-zinc-800 text-[10px] font-bold text-zinc-500 rounded-br-lg">EVIDENCE</div>
                        <p className="text-lg font-mono text-zinc-300 leading-relaxed mt-2">
                            {data.sentence.split('_______').map((part,i,arr)=>(
                                <span key={i}>{part}{i<arr.length-1 && <span className="px-2 border-b-2 border-amber-500 text-amber-500 animate-pulse">????</span>}</span>
                            ))}
                        </p>
                     </div>

                     <form onSubmit={(e)=>{
                         e.preventDefault();
                         if(guess.toLowerCase().trim()===data.answer.toLowerCase().trim()) setStatus("WON");
                         else { const el = document.getElementById('det-inp'); el.classList.add('border-red-500'); setTimeout(()=>el.classList.remove('border-red-500'),500); }
                     }} className="relative">
                        <input id="det-inp" autoFocus type="text" placeholder="Enter missing word..." value={guess} onChange={(e)=>setGuess(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 px-4 text-center text-white font-bold outline-none focus:border-amber-500 transition-all uppercase tracking-wider" />
                        <button type="submit" className="absolute right-2 top-2 p-1.5 text-zinc-400 hover:text-amber-500"><ArrowRight/></button>
                     </form>

                     <div className="flex justify-center gap-4">
                        <button onClick={()=>setShowHint(true)} className="text-xs font-mono text-zinc-500 hover:text-amber-500 flex items-center gap-2">
                            <Lightbulb size={12}/> {showHint ? data.meaning : "EXAMINE CLUE"}
                        </button>
                        <button onClick={()=>{setRevealed(true); setStatus("WON");}} className="text-xs font-mono text-zinc-500 hover:text-red-500 flex items-center gap-2">
                            <Eye size={12}/> REVEAL TRUTH
                        </button>
                     </div>
                </div>
            ) : null}
         </div>
      </motion.div>
    </div>
  );
}
