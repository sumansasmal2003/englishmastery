"use client";
import { useState, useEffect, useRef } from "react";
import {
  Lightbulb, MapPin, Users, FileText, Heart, Book, Loader2, X, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientWritingViewer({ writing }) {

  // --- Dictionary State ---
  const [selection, setSelection] = useState(null);

  // --- 1. SMART WORD DETECTION (Click/Tap) ---
  const handleSmartClick = async (e) => {
    // If user is selecting a phrase (dragging), ignore simple click logic
    const currentSelection = window.getSelection().toString().trim();
    if (currentSelection.length > 0) {
        fetchMeaning(currentSelection);
        return;
    }

    // Otherwise, try to find the word under the tap/click
    let word = "";

    // Standard (Chrome, Safari, Edge, Android)
    if (document.caretRangeFromPoint) {
      const range = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (range && range.startContainer.nodeType === Node.TEXT_NODE) {
        word = expandToWord(range.startContainer, range.startOffset);
      }
    }
    // Firefox fallback
    else if (document.caretPositionFromPoint) {
      const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
      if (pos && pos.offsetNode.nodeType === Node.TEXT_NODE) {
        word = expandToWord(pos.offsetNode, pos.offset);
      }
    }

    if (word && word.length > 1) {
      fetchMeaning(word);
    }
  };

  // Helper: Expand a single point in a text node to the full word
  const expandToWord = (textNode, offset) => {
    const text = textNode.textContent;
    const isWordChar = (char) => /^[a-zA-Z0-9'-]+$/.test(char);

    let start = offset;
    let end = offset;

    while (start > 0 && isWordChar(text[start - 1])) {
      start--;
    }
    while (end < text.length && isWordChar(text[end])) {
      end++;
    }

    return text.substring(start, end).trim();
  };

  // --- 2. API FETCHING ---
  const fetchMeaning = async (text) => {
    const cleanText = text.replace(/[^a-zA-Z0-9\s'-]/g, '').trim();
    if (!cleanText || cleanText.length < 2) return;

    if (selection?.word.toLowerCase() === cleanText.toLowerCase()) return;

    setSelection({ word: cleanText, meaning: null, loading: true });

    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=en|bn`);
      const data = await res.json();

      if (data && data.responseData) {
        setSelection({
          word: cleanText,
          meaning: data.responseData.translatedText,
          loading: false
        });
      } else {
        setSelection({ word: cleanText, meaning: "Definition not found", loading: false });
      }
    } catch (error) {
      console.error("Dictionary Error:", error);
      setSelection({ word: cleanText, meaning: "Network Error", loading: false });
    }
  };

  const closeDictionary = () => {
    window.getSelection().removeAllRanges();
    setSelection(null);
  };

  // --- Family Tree Logic ---
  const renderTree = (parentId, members) => {
      const children = members.filter(m => m.parentId === parentId && m.parentId !== 'spouse');
      if (children.length === 0 && parentId === null) return null;

      return (
          <div className="flex gap-8 justify-center pt-8 relative">
              {children.map((child, index) => {
                  const spouse = members.find(m => m.id === child.partnerId);
                  const hasChildren = members.some(m => m.parentId === child.id);
                  return (
                      <div key={child.id} className="flex flex-col items-center relative">
                          {parentId !== null && <div className="absolute -top-8 left-1/2 w-px h-8 bg-zinc-300 dark:bg-zinc-700"></div>}
                          {children.length > 1 && (<><div className={`absolute -top-8 h-px bg-zinc-300 dark:bg-zinc-700 ${index === 0 ? 'w-1/2 right-0' : 'w-full left-0'}`}></div><div className={`absolute -top-8 h-px bg-zinc-300 dark:bg-zinc-700 ${index === children.length - 1 ? 'w-1/2 left-0' : 'w-full right-0'}`}></div></>)}

                          <div className="flex items-center relative z-10 gap-6">
                              <MemberCard member={child} />
                              {spouse && (
                                  <>
                                    <div className="w-8 h-px bg-zinc-300 dark:bg-zinc-600 relative flex items-center justify-center">
                                        <div className="p-1 bg-white dark:bg-black rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm"><Heart size={8} className="text-rose-500 fill-rose-500" /></div>
                                    </div>
                                    <MemberCard member={spouse} isSpouse={true} />
                                  </>
                              )}
                          </div>
                          {hasChildren && (
                              <div className="relative mt-0">
                                  <div className={`absolute -top-0 w-px h-8 bg-zinc-300 dark:bg-zinc-700 ${spouse ? 'left-[calc(50%-1rem)]' : 'left-1/2'}`}></div>
                                  {renderTree(child.id, members)}
                              </div>
                          )}
                      </div>
                  );
              })}
          </div>
      );
  };

  const MemberCard = ({ member, isSpouse }) => (
      <div className={`flex flex-col items-center justify-center w-28 h-28 p-3 rounded-full shadow-md border-2 bg-white dark:bg-[#111] ${isSpouse ? 'border-rose-100 dark:border-rose-900/30' : 'border-indigo-50 dark:border-indigo-900/30'}`}>
          <span className={`text-[9px] font-bold uppercase tracking-wider mb-1 text-center ${isSpouse ? 'text-rose-500' : 'text-indigo-500'}`}>{member.relation}</span>
          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 text-center leading-tight line-clamp-2">{member.name}</h4>
          {member.details && <span className="text-[9px] text-zinc-400 text-center mt-1">{member.details}</span>}
      </div>
  );

  return (
    <div className="space-y-12 pb-24 relative">
        {/* 1. Question Card */}
        <section className="space-y-6">
            <div
                onClick={handleSmartClick}
                className="bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm relative overflow-hidden cursor-pointer"
            >
                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Question Prompt</h3>
                    <div className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500 flex items-center gap-1">
                        <Book size={10} /> Tap any word
                    </div>
                </div>
                <p className="text-lg md:text-xl text-zinc-900 dark:text-white leading-relaxed font-medium selection:bg-rose-200 dark:selection:bg-rose-900">
                    {writing.question}
                </p>
            </div>

            {/* 2. Context / Hints / Charts */}
            {(writing.data?.hints?.length > 0 || writing.data?.familyMembers?.length > 0 || writing.data?.passage) && (
                <div className="space-y-6">
                    {/* Hints */}
                    {writing.data.hints?.length > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl p-6">
                            <h4 className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Lightbulb size={14}/> Points to Cover
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {writing.data.hints.map((h, i) => (
                                    <span key={i} onClick={handleSmartClick} className="cursor-pointer px-3 py-1.5 bg-white dark:bg-black/20 border border-amber-200 dark:border-amber-800/50 rounded-lg text-sm text-amber-900 dark:text-amber-200 font-medium selection:bg-amber-200 dark:selection:bg-amber-900 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors">
                                        {h}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Family Chart */}
                    {writing.type === 'FAMILY_CHART' && writing.data.familyMembers && (
                        <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-8 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
                            <div className="min-w-max">
                                {renderTree(null, writing.data.familyMembers)}
                            </div>
                        </div>
                    )}
                    {/* Summary Passage */}
                    {writing.type === 'SUMMARY' && writing.data.passage && (
                        <div onClick={handleSmartClick} className="cursor-pointer bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 font-serif text-lg leading-relaxed text-zinc-800 dark:text-zinc-300 selection:bg-rose-200 dark:selection:bg-rose-900">
                            {writing.data.passage}
                        </div>
                    )}
                    {/* Dialogue Context */}
                    {writing.type === 'DIALOGUE' && (
                        <div className="flex flex-wrap gap-4">
                            {writing.data.characters && (
                                <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center gap-2 text-sm font-bold text-zinc-600 dark:text-zinc-300">
                                    <Users size={16}/> {writing.data.characters.join(' & ')}
                                </div>
                            )}
                            {writing.data.setting && (
                                <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center gap-2 text-sm font-bold text-zinc-600 dark:text-zinc-300">
                                    <MapPin size={16}/> {writing.data.setting}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </section>

        {/* 3. Divider */}
        <div className="flex items-center gap-4 py-4">
            <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1"></div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <FileText size={14}/> Model Answer
            </span>
            <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1"></div>
        </div>

        {/* 4. Model Answer Area */}
        <div className="space-y-6" onClick={handleSmartClick}>
            {/* --- NOTICE WRITING --- */}
            {writing.type === 'NOTICE' ? (
                <div className="bg-white dark:bg-[#151515] border border-zinc-300 dark:border-zinc-700 p-8 md:p-12 shadow-2xl max-w-2xl mx-auto transform transition-all hover:scale-[1.01] cursor-pointer">
                    <div className="text-center space-y-2 mb-8">
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide text-lg selection:bg-rose-200 dark:selection:bg-rose-900">{writing.data?.senderAddress || "ORGANIZATION NAME"}</h3>
                        <div className="inline-block bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black px-3 py-1 text-xs font-bold tracking-[0.2em]">NOTICE</div>
                    </div>

                    <div className="flex justify-between items-end mb-6 text-sm font-bold text-zinc-600 dark:text-zinc-400">
                        <span>{writing.data?.date || "Date..."}</span>
                    </div>

                    <h4 className="text-center text-xl font-bold underline underline-offset-4 uppercase mb-8 text-zinc-900 dark:text-white selection:bg-rose-200 dark:selection:bg-rose-900">
                        {writing.data?.subject || "HEADING"}
                    </h4>

                    <div className="text-justify font-serif text-lg leading-loose text-zinc-800 dark:text-zinc-300 mb-12 whitespace-pre-wrap selection:bg-rose-200 dark:selection:bg-rose-900">
                        {writing.modelAnswer}
                    </div>

                    <div className="mt-8 text-left">
                        <p className="font-bold text-zinc-900 dark:text-white selection:bg-rose-200 dark:selection:bg-rose-900">{writing.data?.senderName}</p>
                        <p className="text-sm text-zinc-500 uppercase tracking-wider font-bold text-[10px]">{writing.data?.salutation || "Designation"}</p>
                    </div>
                </div>
            ) : (
                /* --- STANDARD / LETTER FORMAT --- */
                <div className="bg-white dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 p-8 md:p-12 rounded-2xl shadow-xl font-serif text-lg leading-loose text-zinc-800 dark:text-zinc-200 cursor-pointer">

                    {/* FORMAL LETTER HEADER */}
                    {writing.type === 'FORMAL_LETTER' && (
                        <div className="space-y-6 mb-8 text-base font-sans text-zinc-600 dark:text-zinc-400">
                            <div className="whitespace-pre-wrap selection:bg-rose-200 dark:selection:bg-rose-900">
                                <p className="font-bold text-zinc-900 dark:text-white">To,</p>
                                {writing.data?.receiverAddress}
                            </div>
                            {writing.data?.subject && (
                                <p className="font-bold underline text-zinc-900 dark:text-white selection:bg-rose-200 dark:selection:bg-rose-900">
                                    Sub: {writing.data.subject}
                                </p>
                            )}
                            <p className="selection:bg-rose-200 dark:selection:bg-rose-900">{writing.data?.salutation}</p>
                        </div>
                    )}

                    {/* INFORMAL LETTER HEADER (FIXED) */}
                    {writing.type === 'INFORMAL_LETTER' && (
                        <div className="mb-8 font-sans text-zinc-600 dark:text-zinc-400">
                            {/* Top Right: Sender Address & Date */}
                            <div className="flex flex-col items-end text-right mb-8">
                                <div className="whitespace-pre-wrap mb-1 selection:bg-rose-200 dark:selection:bg-rose-900">{writing.data?.senderAddress}</div>
                                <div className="font-bold selection:bg-rose-200 dark:selection:bg-rose-900">{writing.data?.date}</div>
                            </div>

                            {/* Optional Subject */}
                            {writing.data?.subject && (
                                <div className="mb-4 font-bold text-zinc-900 dark:text-white underline">
                                    Subject: {writing.data.subject}
                                </div>
                            )}

                            {/* Salutation */}
                            <div className="font-bold text-zinc-900 dark:text-white text-lg">
                                {writing.data?.salutation}
                            </div>
                        </div>
                    )}

                    {/* BODY */}
                    <div className="whitespace-pre-wrap mb-8 selection:bg-rose-200 dark:selection:bg-rose-900">
                        {writing.modelAnswer}
                    </div>

                    {/* FOOTER */}
                    {['INFORMAL_LETTER', 'FORMAL_LETTER'].includes(writing.type) && (
                        <div className={`flex flex-col ${writing.type === 'FORMAL_LETTER' ? 'items-start text-left' : 'items-end text-right'} pt-8`}>
                            <p className="italic mb-2 selection:bg-rose-200 dark:selection:bg-rose-900">{writing.data?.closing || "Yours,"}</p>
                            <p className="font-bold text-xl not-italic selection:bg-rose-200 dark:selection:bg-rose-900">{writing.data?.senderName}</p>

                            {/* Formal Letter Date at bottom left sometimes */}
                            {writing.type === 'FORMAL_LETTER' && (
                                <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800 w-full text-sm font-sans text-zinc-500 selection:bg-rose-200 dark:selection:bg-rose-900">
                                    Date: {writing.data?.date} <br/>
                                    Place: {writing.data?.senderAddress}
                                </div>
                            )}

                            {/* INFORMAL LETTER: Recipient Address at Bottom Left (FIXED) */}
                            {writing.type === 'INFORMAL_LETTER' && writing.data?.receiverAddress && (
                                <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800 w-full text-left text-sm font-sans text-zinc-500">
                                    <span className="font-bold block mb-1">To:</span>
                                    <div className="whitespace-pre-wrap selection:bg-rose-200 dark:selection:bg-rose-900">
                                        {writing.data.receiverAddress}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* --- FLOATING DICTIONARY CARD --- */}
        <AnimatePresence>
            {selection && (
                <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    onClick={closeDictionary}
                    className="fixed inset-0 bg-black z-[60] md:hidden"
                />
                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    className="
                        fixed z-[70]
                        bottom-0 left-0 right-0 w-full rounded-t-2xl
                        md:bottom-6 md:right-6 md:left-auto md:w-80 md:rounded-xl
                        bg-white dark:bg-zinc-900
                        border-t md:border border-zinc-200 dark:border-zinc-700
                        shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.2)] md:shadow-2xl
                        overflow-hidden
                    "
                >
                    <div className="bg-indigo-600 px-4 py-3 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2 font-bold text-sm">
                            <Book size={16} /> Dictionary
                        </div>
                        <button onClick={closeDictionary} className="hover:bg-indigo-700 p-1 rounded transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="mb-2">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Selected Word</span>
                            <p className="text-2xl font-black text-zinc-900 dark:text-white break-words mt-1 tracking-tight">
                                {selection.word}
                            </p>
                        </div>
                        <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-4"></div>
                        <div>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Bengali Meaning</span>
                            {selection.loading ? (
                                <div className="flex items-center gap-2 text-indigo-500 mt-2">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span className="text-sm font-medium">Translating...</span>
                                </div>
                            ) : (
                                <p className="text-xl font-serif text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
                                    {selection.meaning}
                                </p>
                            )}
                        </div>
                        <div className="mt-6 pt-3 border-t border-zinc-50 dark:border-zinc-800 text-[10px] text-zinc-400 text-center">
                            Powered by MyMemory Translation
                        </div>
                    </div>
                </motion.div>
                </>
            )}
        </AnimatePresence>
    </div>
  );
}
