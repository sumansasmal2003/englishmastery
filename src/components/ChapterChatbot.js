"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Sparkles, Bot, User } from "lucide-react";

export default function ChapterChatbot({ chapterId, chapterTitle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "model", text: `Hi! I'm your AI Tutor for "${chapterTitle}". Ask me anything about the stories, meanings, or exercises!` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");

    // Optimistically update UI
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      // FIX: Filter out the specific initial "model" greeting
      // We assume the first message (index 0) is always the artificial greeting
      const history = messages
        .filter((_, index) => index > 0)
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

      const res = await fetch(`/api/chapters/${chapterId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history })
      });

      const data = await res.json();

      if (data.success) {
        setMessages(prev => [...prev, { role: "model", text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: "model", text: "Sorry, I'm having trouble connecting to the tutor right now." }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "model", text: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 left-6 z-50 p-4 rounded-full shadow-xl transition-all hover:scale-110 active:scale-95 flex items-center gap-2 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 bg-zinc-900 dark:bg-white text-white dark:text-black'}`}
      >
        <Sparkles size={20} />
        <span className="font-bold text-sm hidden md:inline">Ask AI Tutor</span>
      </button>

      {/* Chat Window Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-6 z-[60] w-[90vw] md:w-[400px] h-[500px] max-h-[80vh] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 dark:bg-indigo-500/20 rounded">
                    <Bot size={18} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">AI Tutor</h3>
                    <p className="text-[10px] text-zinc-500">Discussing "{chapterTitle}"</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors text-zinc-500">
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white dark:bg-[#050505]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'model' && (
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot size={12} className="text-indigo-600 dark:text-indigo-400"/>
                    </div>
                  )}
                  <div className={`p-3 rounded text-sm max-w-[80%] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-black rounded-tr-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                   <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
                        <Bot size={12} className="text-indigo-600 dark:text-indigo-400"/>
                    </div>
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded rounded-tl-sm">
                        <Loader2 size={16} className="animate-spin text-zinc-400" />
                    </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
              <div className="relative flex items-center">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full pl-4 pr-12 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="absolute right-2 p-1.5 bg-indigo-600 text-white rounded disabled:opacity-50 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 hover:bg-indigo-700 transition-colors"
                >
                    <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
