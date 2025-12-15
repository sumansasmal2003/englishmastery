"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Layers, FileText, User, ArrowLeft, CheckCircle2, AlertCircle, Edit3, RefreshCw, FilePlus, BookOpen, PenTool } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// --- Styled Components ---
const InputLabel = ({ children, icon: Icon }) => (
  <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-2">
    {Icon && <Icon size={12} />}
    {children}
  </label>
);

const ThemedInput = ({ ...props }) => (
  <input
    {...props}
    className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm rounded-lg p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-sm dark:shadow-none"
  />
);

const ThemedTextarea = ({ ...props }) => (
  <textarea
    {...props}
    className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm rounded-lg p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 resize-none min-h-[100px] shadow-sm dark:shadow-none"
  />
);

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("chapter"); // 'chapter' | 'grammar'
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [chaptersList, setChaptersList] = useState([]);
  const [grammarList, setGrammarList] = useState([]);
  const [notification, setNotification] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // --- Initial States ---
  const initialChapterState = {
    classLevel: 5,
    title: "",
    author: "",
    chapterNumber: 1,
    units: [{ title: "Unit 1", paragraphs: [{ english: "", bengali: "" }], activities: [] }],
  };

  // REMOVED classLevel from grammar state
  const initialGrammarState = {
    topic: "",
    description: "",
    sections: [{ title: "Rule 1", content: "", examples: [{ sentence: "", explanation: "" }] }]
  };

  const [chapterForm, setChapterForm] = useState(initialChapterState);
  const [grammarForm, setGrammarForm] = useState(initialGrammarState);

  // --- Effects ---
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  async function fetchData() {
    setFetching(true);
    try {
        const endpoint = activeTab === "chapter" ? "/api/chapters" : "/api/grammar";
        const res = await fetch(endpoint);
        const data = await res.json();
        if (data.success) {
            if (activeTab === "chapter") setChaptersList(data.data);
            else setGrammarList(data.data);
        }
    } catch (error) {
        console.error("Failed to load data");
    } finally {
        setFetching(false);
    }
  }

  // --- Helpers ---
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const resetForm = () => {
    setEditingId(null);
    if (activeTab === "chapter") setChapterForm(initialChapterState);
    else setGrammarForm(initialGrammarState);
  };

  const loadForEdit = (item) => {
    setEditingId(item._id);
    if (activeTab === "chapter") {
        setChapterForm({ ...item });
    } else {
        setGrammarForm({ ...item });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Grammar Handlers ---
  const addGrammarSection = () => {
    setGrammarForm({
        ...grammarForm,
        sections: [...grammarForm.sections, { title: `Rule ${grammarForm.sections.length + 1}`, content: "", examples: [] }]
    });
  };
  const removeGrammarSection = (idx) => {
      const newSections = [...grammarForm.sections];
      newSections.splice(idx, 1);
      setGrammarForm({ ...grammarForm, sections: newSections });
  };
  const updateSection = (idx, field, val) => {
      const newSections = [...grammarForm.sections];
      newSections[idx][field] = val;
      setGrammarForm({ ...grammarForm, sections: newSections });
  };
  const addExample = (sectionIdx) => {
      const newSections = [...grammarForm.sections];
      newSections[sectionIdx].examples.push({ sentence: "", explanation: "" });
      setGrammarForm({ ...grammarForm, sections: newSections });
  };
  const updateExample = (sectionIdx, exIdx, field, val) => {
      const newSections = [...grammarForm.sections];
      newSections[sectionIdx].examples[exIdx][field] = val;
      setGrammarForm({ ...grammarForm, sections: newSections });
  };
  const removeExample = (sectionIdx, exIdx) => {
      const newSections = [...grammarForm.sections];
      newSections[sectionIdx].examples.splice(exIdx, 1);
      setGrammarForm({ ...grammarForm, sections: newSections });
  };

  // --- Chapter Handlers ---
  const addUnit = () => {
    setChapterForm({
      ...chapterForm,
      units: [...chapterForm.units, { title: `Unit ${chapterForm.units.length + 1}`, paragraphs: [{ english: "", bengali: "" }], activities: [] }],
    });
  };
  const updateUnitTitle = (idx, val) => {
      const newUnits = [...chapterForm.units];
      newUnits[idx].title = val;
      setChapterForm({ ...chapterForm, units: newUnits });
  };
  const removeUnit = (idx) => {
      const newUnits = [...chapterForm.units];
      newUnits.splice(idx, 1);
      setChapterForm({ ...chapterForm, units: newUnits });
  };
  const addParagraph = (uIdx) => {
      const newUnits = [...chapterForm.units];
      newUnits[uIdx].paragraphs.push({ english: "", bengali: "" });
      setChapterForm({ ...chapterForm, units: newUnits });
  };
  const updateParagraph = (uIdx, pIdx, field, val) => {
      const newUnits = [...chapterForm.units];
      newUnits[uIdx].paragraphs[pIdx][field] = val;
      setChapterForm({ ...chapterForm, units: newUnits });
  };
  const removeParagraph = (uIdx, pIdx) => {
      const newUnits = [...chapterForm.units];
      newUnits[uIdx].paragraphs.splice(pIdx, 1);
      setChapterForm({ ...chapterForm, units: newUnits });
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const method = editingId ? "PUT" : "POST";
    const endpoint = activeTab === "chapter" ? "/api/chapters" : "/api/grammar";
    let payload = activeTab === "chapter" ? chapterForm : grammarForm;
    if (editingId) payload = { ...payload, _id: editingId };

    try {
      const res = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showNotification('success', editingId ? 'Updated successfully!' : 'Created successfully!');
        if (!editingId) resetForm();
        fetchData();
      } else {
        showNotification('error', data.error || 'Operation failed.');
      }
    } catch (error) {
      console.error(error);
      showNotification('error', 'Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-200 font-sans selection:bg-indigo-500/30">

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-40 border-b border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-full transition-colors">
               <ArrowLeft size={20} />
            </Link>

            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <button
                    onClick={() => { setActiveTab("chapter"); resetForm(); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === "chapter" ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                >
                    <BookOpen size={14} /> Literature
                </button>
                <button
                    onClick={() => { setActiveTab("grammar"); resetForm(); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === "grammar" ? 'bg-white dark:bg-zinc-800 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                >
                    <PenTool size={14} /> Grammar
                </button>
            </div>
          </div>

          <button onClick={resetForm} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${!editingId ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-indigo-500'}`}>
             <FilePlus size={14} />
             <span>New {activeTab === "chapter" ? "Chapter" : "Topic"}</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Sidebar */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">
                            Existing {activeTab === "chapter" ? "Chapters" : "Topics"}
                        </h2>
                        <button onClick={fetchData} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
                            <RefreshCw size={14} className={fetching ? "animate-spin" : ""} />
                        </button>
                    </div>

                    <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm dark:shadow-none max-h-[400px] lg:max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar">
                        {fetching ? (
                            <div className="p-8 text-center text-zinc-500 text-xs">Loading...</div>
                        ) : (activeTab === "chapter" ? chaptersList : grammarList).length === 0 ? (
                            <div className="p-8 text-center text-zinc-500 text-xs">No items found.</div>
                        ) : (
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                {(activeTab === "chapter" ? chaptersList : grammarList).map((item) => (
                                    <button
                                        key={item._id}
                                        onClick={() => loadForEdit(item)}
                                        className={`w-full text-left p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center justify-between group ${editingId === item._id ? 'bg-indigo-50 dark:bg-indigo-500/10 border-l-4 border-indigo-500' : 'border-l-4 border-transparent'}`}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                {/* Only show Class badge for Chapter */}
                                                {activeTab === "chapter" ? (
                                                    <span className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">Cl {item.classLevel}</span>
                                                ) : (
                                                    <span className="text-[10px] font-mono bg-emerald-100/50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded text-emerald-600 dark:text-emerald-400">Global</span>
                                                )}
                                            </div>
                                            <h3 className={`text-sm font-medium line-clamp-1 ${editingId === item._id ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                                {activeTab === "chapter" ? item.title : item.topic}
                                            </h3>
                                        </div>
                                        {editingId === item._id && <Edit3 size={14} className="text-indigo-500" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Form Area */}
            <div className="lg:col-span-8">
                <form onSubmit={handleSubmit} className="space-y-12">

                    {/* --- CHAPTER FORM --- */}
                    {activeTab === "chapter" && (
                        <>
                            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="border-b border-zinc-200 dark:border-zinc-900 pb-2 mb-6">
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Chapter Metadata</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    <div className="md:col-span-3">
                                        <InputLabel icon={Layers}>Class Level</InputLabel>
                                        <ThemedInput type="number" value={chapterForm.classLevel} onChange={(e) => setChapterForm({...chapterForm, classLevel: e.target.value})} />
                                    </div>
                                    <div className="md:col-span-3">
                                        <InputLabel icon={FileText}>Chapter No.</InputLabel>
                                        <ThemedInput type="number" value={chapterForm.chapterNumber} onChange={(e) => setChapterForm({...chapterForm, chapterNumber: e.target.value})} />
                                    </div>
                                    <div className="md:col-span-6">
                                        <InputLabel icon={User}>Author</InputLabel>
                                        <ThemedInput type="text" value={chapterForm.author} onChange={(e) => setChapterForm({...chapterForm, author: e.target.value})} />
                                    </div>
                                    <div className="md:col-span-12">
                                        <InputLabel icon={FileText}>Title</InputLabel>
                                        <ThemedInput type="text" value={chapterForm.title} onChange={(e) => setChapterForm({...chapterForm, title: e.target.value})} />
                                    </div>
                                </div>
                            </motion.section>

                            <section className="space-y-8">
                                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 pb-2">
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Content Units</h2>
                                    <button type="button" onClick={addUnit} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 uppercase">
                                        <Plus size={14} /> Add Unit
                                    </button>
                                </div>
                                <div className="space-y-10">
                                    {chapterForm.units.map((unit, idx) => (
                                        <div key={idx} className="relative bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                                            <div className="flex gap-4 mb-4">
                                                <div className="flex-1">
                                                     <InputLabel>Unit Title</InputLabel>
                                                     <ThemedInput value={unit.title} onChange={(e) => updateUnitTitle(idx, e.target.value)} />
                                                </div>
                                                <button type="button" onClick={() => removeUnit(idx)} className="mt-6 p-2 text-zinc-400 hover:text-red-500"><Trash2 size={18} /></button>
                                            </div>
                                            <div className="space-y-4 pl-4 border-l border-zinc-200 dark:border-zinc-800">
                                                {unit.paragraphs.map((p, pIdx) => (
                                                    <div key={pIdx} className="grid md:grid-cols-2 gap-4">
                                                        <ThemedTextarea value={p.english} onChange={(e) => updateParagraph(idx, pIdx, 'english', e.target.value)} placeholder="English" />
                                                        <div className="relative">
                                                            <ThemedTextarea value={p.bengali} onChange={(e) => updateParagraph(idx, pIdx, 'bengali', e.target.value)} placeholder="Bengali" />
                                                            <button type="button" onClick={() => removeParagraph(idx, pIdx)} className="absolute top-2 right-2 text-red-400 opacity-50 hover:opacity-100"><Trash2 size={12}/></button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => addParagraph(idx)} className="text-xs font-bold text-zinc-500 hover:text-indigo-500 flex items-center gap-1 justify-center w-full py-2 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg"><Plus size={14}/> Add Paragraph</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </>
                    )}

                    {/* --- GRAMMAR FORM --- */}
                    {activeTab === "grammar" && (
                        <>
                            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="border-b border-zinc-200 dark:border-zinc-900 pb-2 mb-6">
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Grammar Topic Details</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    {/* Class Level Input REMOVED */}
                                    <div className="md:col-span-12">
                                        <InputLabel icon={PenTool}>Topic Name</InputLabel>
                                        <ThemedInput type="text" value={grammarForm.topic} onChange={(e) => setGrammarForm({...grammarForm, topic: e.target.value})} placeholder="e.g. Prepositions" />
                                    </div>
                                    <div className="md:col-span-12">
                                        <InputLabel icon={FileText}>Description (Optional)</InputLabel>
                                        <ThemedInput type="text" value={grammarForm.description} onChange={(e) => setGrammarForm({...grammarForm, description: e.target.value})} placeholder="e.g. Understanding time and place" />
                                    </div>
                                </div>
                            </motion.section>

                            <section className="space-y-8">
                                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 pb-2">
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Rules & Sections</h2>
                                    <button type="button" onClick={addGrammarSection} className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 uppercase">
                                        <Plus size={14} /> Add Rule
                                    </button>
                                </div>
                                <div className="space-y-10">
                                    {grammarForm.sections.map((sec, idx) => (
                                        <div key={idx} className="relative bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                                            <div className="flex gap-4 mb-4">
                                                <div className="flex-1">
                                                     <InputLabel>Rule Title</InputLabel>
                                                     <ThemedInput value={sec.title} onChange={(e) => updateSection(idx, 'title', e.target.value)} placeholder="e.g. Simple Present Tense" />
                                                </div>
                                                <button type="button" onClick={() => removeGrammarSection(idx)} className="mt-6 p-2 text-zinc-400 hover:text-red-500"><Trash2 size={18} /></button>
                                            </div>

                                            <div className="mb-6">
                                                <InputLabel>Explanation / Rule</InputLabel>
                                                <ThemedTextarea value={sec.content} onChange={(e) => updateSection(idx, 'content', e.target.value)} placeholder="Explain the rule here..." />
                                            </div>

                                            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-xs font-bold text-zinc-500 uppercase">Examples</span>
                                                    <button type="button" onClick={() => addExample(idx)} className="text-[10px] bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-600 dark:text-zinc-400 hover:text-emerald-500">+ Add Example</button>
                                                </div>
                                                <div className="space-y-3">
                                                    {sec.examples.map((ex, exIdx) => (
                                                        <div key={exIdx} className="flex gap-2 items-start group">
                                                            <div className="flex-1 grid gap-2">
                                                                <input
                                                                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1.5 text-sm outline-none"
                                                                    placeholder="Sentence (e.g. The sun rises)"
                                                                    value={ex.sentence}
                                                                    onChange={(e) => updateExample(idx, exIdx, 'sentence', e.target.value)}
                                                                />
                                                                <input
                                                                    className="w-full bg-transparent border-b border-dashed border-zinc-300 dark:border-zinc-700 px-2 py-1 text-xs text-zinc-500 outline-none"
                                                                    placeholder="Explanation (Optional)"
                                                                    value={ex.explanation}
                                                                    onChange={(e) => updateExample(idx, exIdx, 'explanation', e.target.value)}
                                                                />
                                                            </div>
                                                            <button type="button" onClick={() => removeExample(idx, exIdx)} className="p-1 text-zinc-400 hover:text-red-500"><Trash2 size={14} /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </>
                    )}
                </form>
            </div>
        </div>
      </main>

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4">
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-2 pl-6 rounded-full shadow-2xl shadow-black/10 dark:shadow-black/50 flex items-center gap-4 transition-colors">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium hidden sm:inline">
                {editingId ? "Updating Content" : "Creating New Content"}
            </span>
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block"></div>
            <button onClick={handleSubmit} disabled={loading} className={`flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-black text-sm font-bold rounded-full transition-all ${loading ? 'opacity-70 cursor-wait' : ''}`}>
                {loading ? <div className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin"></div> : <Save size={16} />}
                <span>{loading ? 'Saving...' : editingId ? 'Update' : 'Publish'}</span>
            </button>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {notification && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-24 right-6 z-50">
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl backdrop-blur-md ${notification.type === 'success' ? 'bg-emerald-100/80 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-red-100/80 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400'}`}>
                    {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span className="text-sm font-medium">{notification.message}</span>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
