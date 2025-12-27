"use client";
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Gamepad2, BrainCircuit, Search, Link as LinkIcon, Shuffle, Layers, ListOrdered, ArrowLeft } from "lucide-react";

import { GameCard } from "./components/GameCard";
import RiddleGame from "./components/RiddleGame";
import ContextDetective from "./components/ContextDetective";
import WordChainGame from "./components/WordChainGame";
import LexiconScramble from "./components/LexiconScramble";
import EchoMatch from "./components/EchoMatch";
import ProverbPuzzle from "./components/ProverbPuzzle";

export default function ArcadePage() {
  const [activeGame, setActiveGame] = useState(null);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-purple-500/30 pb-20">

      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
              <Gamepad2 size={20} />
            </div>
            <div>
                <h1 className="text-lg font-bold leading-none text-zinc-900 dark:text-white">Mind Arcade</h1>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">Daily Brain Training</p>
            </div>
          </div>
          <Link href="/" className="group flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-full">
             <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform"/> Exit Arcade
          </Link>
        </div>
      </header>

      {/* Main Grid */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GameCard title="Riddle Logic" description="Solve the Oracle's riddles against the clock." icon={BrainCircuit} color="from-purple-500 to-pink-500" gradient="from-purple-500 via-pink-500 to-purple-500" onClick={() => setActiveGame('RIDDLE')} />
            <GameCard title="Context Detective" description="Decipher the missing words in the case files." icon={Search} color="from-amber-500 to-orange-500" gradient="from-amber-400 to-orange-600" onClick={() => setActiveGame('DETECTIVE')} />
            <GameCard title="Word Chain AI" description="Duel AI in an infinite word linking battle." icon={LinkIcon} color="from-emerald-500 to-teal-500" gradient="from-emerald-400 to-cyan-600" onClick={() => setActiveGame('WORD_CHAIN')} />
            <GameCard title="Lexicon Scramble" description="Unscramble vocabulary tiles. Speed is key." icon={Shuffle} color="from-blue-500 to-indigo-500" gradient="from-blue-400 to-indigo-600" onClick={() => setActiveGame('SCRAMBLE')} />
            <GameCard title="Echo Match" description="Test your memory with 3D synonym cards." icon={Layers} color="from-pink-500 to-rose-500" gradient="from-pink-400 to-rose-600" onClick={() => setActiveGame('MATCH')} />
            <GameCard title="Proverb Puzzle" description="Reassemble wisdom from jumbled tiles." icon={ListOrdered} color="from-orange-500 to-red-500" gradient="from-orange-400 to-red-600" onClick={() => setActiveGame('PROVERB')} />
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {activeGame === 'RIDDLE' && <RiddleGame onClose={() => setActiveGame(null)} />}
        {activeGame === 'DETECTIVE' && <ContextDetective onClose={() => setActiveGame(null)} />}
        {activeGame === 'WORD_CHAIN' && <WordChainGame onClose={() => setActiveGame(null)} />}
        {activeGame === 'SCRAMBLE' && <LexiconScramble onClose={() => setActiveGame(null)} />}
        {activeGame === 'MATCH' && <EchoMatch onClose={() => setActiveGame(null)} />}
        {activeGame === 'PROVERB' && <ProverbPuzzle onClose={() => setActiveGame(null)} />}
      </AnimatePresence>
    </div>
  );
}
