"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layers, Loader2, Trophy, X, RefreshCcw } from "lucide-react";

export default function EchoMatch({ onClose }) {
    const COMMON_SEEDS = ["happy", "sad", "fast", "slow", "big", "small", "hot", "cold", "start", "end", "smart", "hard"];
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [solved, setSolved] = useState([]);
    const [moves, setMoves] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchGamePairs(); }, []);

    const fetchGamePairs = async () => {
        setLoading(true); setSolved([]); setFlipped([]); setMoves(0);
        try {
            const candidates = [...COMMON_SEEDS].sort(() => 0.5 - Math.random()).slice(0, 8);
            const pairPromises = candidates.map(async (word) => {
                try {
                    const res = await fetch(`https://api.datamuse.com/words?rel_syn=${word}`);
                    const json = await res.json();
                    if (json.length > 0) return { w: word, s: json[0].word };
                } catch (e) { return null; }
            });
            const results = await Promise.all(pairPromises);
            let validPairs = results.filter(p => p && p.w !== p.s).slice(0, 6);
            if(validPairs.length < 6) { // Fallback
                validPairs = [...validPairs, {w:'Big',s:'Huge'}, {w:'Fast',s:'Quick'}].slice(0,6);
            }

            let items = [];
            validPairs.forEach((p, i) => {
                items.push({ id: `w-${i}`, text: p.w, matchId: i, type: 'word' });
                items.push({ id: `s-${i}`, text: p.s, matchId: i, type: 'synonym' });
            });
            setCards(items.sort(() => Math.random() - 0.5));
            setLoading(false);
        } catch (e) { setLoading(false); }
    };

    const handleCardClick = (index) => {
        if (flipped.length === 2 || flipped.includes(index) || solved.includes(cards[index].matchId)) return;
        const newFlipped = [...flipped, index];
        setFlipped(newFlipped);
        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            if (cards[newFlipped[0]].matchId === cards[newFlipped[1]].matchId) {
                setSolved([...solved, cards[newFlipped[0]].matchId]); setFlipped([]);
            } else { setTimeout(() => setFlipped([]), 1000); }
        }
    };

    const isGameOver = !loading && cards.length > 0 && solved.length === (cards.length / 2);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl bg-[#18181b] border border-pink-900/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh] md:h-auto">
                <div className="p-4 flex justify-between items-center bg-pink-900/10 border-b border-pink-900/20">
                    <div className="flex items-center gap-2 font-bold text-pink-500"><Layers size={20} /> ECHO MATCH</div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={20}/></button>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-center overflow-y-auto">
                    {loading ? <div className="text-center"><Loader2 className="animate-spin text-pink-500 mx-auto mb-2"/><p className="text-zinc-500 text-sm">Shuffling Deck...</p></div> :
                    isGameOver ? (
                        <div className="text-center space-y-6">
                            <Trophy size={60} className="text-pink-500 animate-bounce mx-auto" />
                            <h2 className="text-3xl font-bold text-white">Memory Master!</h2>
                            <p className="text-zinc-400">Solved in {moves} moves</p>
                            <button onClick={fetchGamePairs} className="px-8 py-3 bg-pink-600 text-white rounded-full font-bold flex items-center gap-2 mx-auto"><RefreshCcw size={18}/> Play Again</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {cards.map((card, i) => {
                                const isFlipped = flipped.includes(i) || solved.includes(card.matchId);
                                return (
                                    <div key={card.id} onClick={() => handleCardClick(i)} className="aspect-[3/4] sm:aspect-square cursor-pointer perspective-1000 group">
                                        <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
                                            <div className="absolute inset-0 backface-hidden bg-zinc-800 rounded-xl border-2 border-zinc-700 flex items-center justify-center group-hover:border-pink-500/50 transition-colors">
                                                <Layers className="text-zinc-700 w-8 h-8" />
                                            </div>
                                            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-pink-600 rounded-xl flex items-center justify-center p-2 text-center shadow-lg border-2 border-pink-400">
                                                <span className="text-xs sm:text-sm font-bold text-white uppercase break-words">{card.text}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
