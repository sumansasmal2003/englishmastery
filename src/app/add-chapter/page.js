"use client";
import { useState } from "react";
import { Plus, Trash2, Save, Layers, FileText, User, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// --- Styled Components (Updated for Light/Dark) ---
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
    className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm rounded-lg p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 resize-none min-h-[120px] shadow-sm dark:shadow-none"
  />
);

export default function AddChapter() {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    classLevel: 5,
    title: "",
    author: "",
    chapterNumber: 1,
    units: [
      {
        title: "Unit 1",
        paragraphs: [{ english: "", bengali: "" }],
        activities: [],
      },
    ],
  });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleBasicChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addUnit = () => {
    setFormData({
      ...formData,
      units: [
        ...formData.units,
        { title: `Unit ${formData.units.length + 1}`, paragraphs: [{ english: "", bengali: "" }], activities: [] },
      ],
    });
  };

  const removeUnit = (index) => {
    const newUnits = [...formData.units];
    newUnits.splice(index, 1);
    setFormData({ ...formData, units: newUnits });
  };

  const updateUnitTitle = (index, value) => {
    const newUnits = [...formData.units];
    newUnits[index].title = value;
    setFormData({ ...formData, units: newUnits });
  };

  const addParagraph = (unitIndex) => {
    const newUnits = [...formData.units];
    newUnits[unitIndex].paragraphs.push({ english: "", bengali: "" });
    setFormData({ ...formData, units: newUnits });
  };

  const updateParagraph = (unitIndex, pIndex, field, value) => {
    const newUnits = [...formData.units];
    newUnits[unitIndex].paragraphs[pIndex][field] = value;
    setFormData({ ...formData, units: newUnits });
  };

  const removeParagraph = (unitIndex, pIndex) => {
      const newUnits = [...formData.units];
      newUnits[unitIndex].paragraphs.splice(pIndex, 1);
      setFormData({ ...formData, units: newUnits });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Chapter published successfully!');
      } else {
        showNotification('error', data.error || 'Failed to save chapter.');
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

      {/* --- Sticky Header --- */}
      <header className="fixed top-0 inset-x-0 z-40 border-b border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl transition-colors">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
               <ArrowLeft size={20} />
            </Link>
            <h1 className="font-semibold text-sm tracking-wide text-zinc-900 dark:text-zinc-100">Editor Workspace</h1>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-xs text-zinc-500 dark:text-zinc-600 hidden sm:inline-block">Draft Mode</span>
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
        </div>
      </header>

      {/* --- Main Form --- */}
      <main className="max-w-6xl mx-auto px-6 pt-24 pb-32">
        <form onSubmit={handleSubmit} className="space-y-12">

            {/* 1. Metadata Section */}
            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div className="border-b border-zinc-200 dark:border-zinc-900 pb-2 mb-6">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Chapter Metadata</h2>
                    <p className="text-sm text-zinc-500">Define the core information for this chapter.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-3">
                        <InputLabel icon={Layers}>Class Level</InputLabel>
                        <ThemedInput type="number" name="classLevel" value={formData.classLevel} onChange={handleBasicChange} />
                    </div>
                    <div className="md:col-span-3">
                        <InputLabel icon={FileText}>Chapter No.</InputLabel>
                        <ThemedInput type="number" name="chapterNumber" value={formData.chapterNumber} onChange={handleBasicChange} />
                    </div>
                    <div className="md:col-span-6">
                         <InputLabel icon={User}>Author Name</InputLabel>
                        <ThemedInput type="text" name="author" value={formData.author} onChange={handleBasicChange} placeholder="e.g. William Wordsworth" />
                    </div>
                    <div className="md:col-span-12">
                        <InputLabel icon={FileText}>Chapter Title</InputLabel>
                        <ThemedInput type="text" name="title" value={formData.title} onChange={handleBasicChange} placeholder="e.g. The Daffodils" className="text-lg font-medium" />
                    </div>
                </div>
            </motion.section>


            {/* 2. Content Units */}
            <section className="space-y-8">
                 <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 pb-2">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Content Units</h2>
                        <p className="text-sm text-zinc-500">Manage paragraphs and translations.</p>
                    </div>
                    <button
                        type="button"
                        onClick={addUnit}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1 uppercase tracking-wider"
                    >
                        <Plus size={14} /> Add Unit
                    </button>
                </div>

                <div className="space-y-10">
                    {formData.units.map((unit, unitIndex) => (
                        <motion.div
                            key={unitIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative group bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm dark:shadow-none"
                        >
                            {/* Unit Header */}
                            <div className="flex items-start gap-4 mb-8">
                                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-bold text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                    {unitIndex + 1}
                                </div>
                                <div className="flex-1">
                                    <InputLabel>Unit Title</InputLabel>
                                    <ThemedInput
                                        value={unit.title}
                                        onChange={(e) => updateUnitTitle(unitIndex, e.target.value)}
                                        placeholder="e.g. Stanza 1"
                                    />
                                </div>
                                {formData.units.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeUnit(unitIndex)}
                                        className="mt-6 p-2 text-zinc-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Delete Unit"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>

                            {/* Paragraphs */}
                            <div className="space-y-6 pl-4 border-l border-zinc-200 dark:border-zinc-800 ml-3">
                                {unit.paragraphs.map((para, pIndex) => (
                                    <div key={pIndex} className="relative grid md:grid-cols-2 gap-4 bg-zinc-50 dark:bg-black/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/50 group/para hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                                        <div>
                                            <InputLabel>English Text</InputLabel>
                                            <ThemedTextarea
                                                value={para.english}
                                                onChange={(e) => updateParagraph(unitIndex, pIndex, 'english', e.target.value)}
                                                placeholder="Original content..."
                                            />
                                        </div>
                                        <div>
                                            <InputLabel>Bengali Translation</InputLabel>
                                            <ThemedTextarea
                                                value={para.bengali}
                                                onChange={(e) => updateParagraph(unitIndex, pIndex, 'bengali', e.target.value)}
                                                placeholder="অনুবাদ লিখুন..."
                                            />
                                        </div>

                                        {/* Remove Paragraph Button */}
                                        {unit.paragraphs.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeParagraph(unitIndex, pIndex)}
                                                className="absolute -right-2 -top-2 bg-white dark:bg-zinc-800 text-zinc-400 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-full shadow-lg opacity-0 group-hover/para:opacity-100 transition-opacity border border-zinc-200 dark:border-zinc-700"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => addParagraph(unitIndex)}
                                    className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-indigo-600 dark:hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 w-full justify-center border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-zinc-600"
                                >
                                    <Plus size={14} /> Add Paragraph Block
                                </button>
                            </div>

                        </motion.div>
                    ))}
                </div>

                {/* Add Unit Button (Bottom) */}
                <button
                    type="button"
                    onClick={addUnit}
                    className="w-full py-6 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all flex flex-col items-center justify-center gap-2 group"
                >
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                         <Plus size={20} />
                    </div>
                    <span className="text-sm font-medium">Create New Unit</span>
                </button>
            </section>
        </form>
      </main>

      {/* --- Floating Action Bar --- */}
      <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4">
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-2 pl-6 rounded-full shadow-2xl shadow-black/10 dark:shadow-black/50 flex items-center gap-4 transition-colors">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium hidden sm:inline">
                {formData.units.reduce((acc, u) => acc + u.paragraphs.length, 0)} Paragraphs across {formData.units.length} Units
            </span>
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block"></div>
            <button
                onClick={handleSubmit}
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-black text-sm font-bold rounded-full transition-all ${loading ? 'opacity-70 cursor-wait' : ''}`}
            >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin"></div>
                ) : (
                    <Save size={16} />
                )}
                <span>{loading ? 'Publishing...' : 'Publish Chapter'}</span>
            </button>
        </div>
      </div>

      {/* --- Notification Toast --- */}
      <AnimatePresence>
        {notification && (
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-24 right-6 z-50"
            >
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl backdrop-blur-md ${
                    notification.type === 'success'
                        ? 'bg-emerald-100/80 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                        : 'bg-red-100/80 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400'
                }`}>
                    {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span className="text-sm font-medium">{notification.message}</span>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
