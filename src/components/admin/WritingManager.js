"use client";
import { useState, useEffect } from "react";
import { FileText, Plus, Save, Loader2, Trash2, Edit3, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WritingBuilder from "@/app/add-chapter/components/WritingBuilder";
import { InputLabel, ThemedInput, SidebarSkeleton } from "@/app/add-chapter/components/SharedUI";

export default function WritingManager({ showNotification }) {
  const [writings, setWritings] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Initial Empty State
  const initialForm = {
    title: "",
    type: "PARAGRAPH",
    question: "",
    data: { hints: [], wordLimit: "" },
    modelAnswer: ""
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetchWritings();
  }, []);

  const fetchWritings = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/writings");
      const data = await res.json();
      if (data.success) setWritings(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    // Ensure all data fields exist to prevent crashes
    setForm({
      ...item,
      data: {
        hints: [],
        characters: [],
        familyMembers: [],
        ...item.data
      }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this writing task?")) return;
    try {
      const res = await fetch(`/api/writings/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("success", "Deleted successfully");
        fetchWritings();
        if (editingId === id) resetForm();
      }
    } catch (e) {
      showNotification("error", "Failed to delete");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- FIX: Allow Title to fall back to Question if empty ---
    const finalTitle = form.title || form.question;

    if (!finalTitle || !form.question) {
        showNotification("error", "Question/Prompt is required");
        return;
    }

    setLoading(true);
    const method = editingId ? "PUT" : "POST";

    // Construct payload with the fixed title
    const payload = editingId
        ? { ...form, title: finalTitle, _id: editingId }
        : { ...form, title: finalTitle };

    try {
      const res = await fetch("/api/writings", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        showNotification("success", editingId ? "Updated Successfully" : "Created Successfully");
        fetchWritings();
        resetForm();
      } else {
        showNotification("error", data.error);
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Writing Types Dropdown
  const WRITING_TYPES = [
    'PARAGRAPH', 'STORY', 'NOTICE', 'FAMILY_CHART',
    'FORMAL_LETTER', 'INFORMAL_LETTER', 'PROCESS',
    'DIARY', 'DIALOGUE', 'SUMMARY'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

      {/* --- SIDEBAR LIST --- */}
      <div className="lg:col-span-4 lg:sticky lg:top-24">
        <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar">
            {fetching ? <SidebarSkeleton /> : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                    {writings.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500 text-xs">No writing tasks yet.</div>
                    ) : writings.map((item) => (
                        <div key={item._id} className={`w-full text-left p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all flex items-center justify-between group ${editingId === item._id ? 'bg-zinc-50 dark:bg-zinc-800/80 border-l-4 border-zinc-900 dark:border-zinc-100' : 'border-l-4 border-transparent'}`}>
                            <button onClick={() => handleEdit(item)} className="flex-1 text-left">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                                        {item.type.replace('_', ' ')}
                                    </span>
                                </div>
                                <h3 className={`text-sm font-medium line-clamp-1 ${editingId === item._id ? 'text-black dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                    {item.title}
                                </h3>
                            </button>
                            <div className="flex items-center gap-1">
                                <button onClick={() => handleDelete(item._id)} className="p-2 text-zinc-400 hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* --- MAIN EDITOR --- */}
      <div className="lg:col-span-8">
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* Header / Type Selection */}
            <div className="bg-white dark:bg-zinc-900/10 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <FileText size={18} className="text-indigo-500" />
                        <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                            {editingId ? "Edit Task" : "New Writing Task"}
                        </h2>
                    </div>
                    {editingId && (
                        <button type="button" onClick={resetForm} className="text-xs flex items-center gap-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                            <Plus size={14} /> Create New
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <InputLabel>Task Type</InputLabel>
                        <select
                            className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                        >
                            {WRITING_TYPES.map(t => (
                                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <InputLabel>Internal Title (Admin Only)</InputLabel>
                        <ThemedInput
                            placeholder="Optional - defaults to Question"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Reusing WritingBuilder for the dynamic form fields */}
            <WritingBuilder
                unitIdx={0}
                wIdx={0}
                writing={form}
                onChange={(updated) => setForm(updated)}
                onRemove={() => {}}
            />

            {/* Save Button */}
            <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
                <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-2 pl-6 rounded-full shadow-2xl flex items-center gap-4 pointer-events-auto">
                    <span className="text-xs text-zinc-500 font-medium hidden sm:inline">
                        {editingId ? "Updating Task..." : "Creating New Task..."}
                    </span>
                    <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 hidden sm:block"></div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex items-center gap-2 px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-full hover:scale-105 active:scale-95 transition-all ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin"/> : <Save size={16} />}
                        <span>{editingId ? 'Update Changes' : 'Publish Task'}</span>
                    </button>
                </div>
            </div>

        </form>
      </div>
    </div>
  );
}
