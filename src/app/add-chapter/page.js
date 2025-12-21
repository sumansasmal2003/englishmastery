"use client";
import { useState, useEffect } from "react";
import {
  Plus, Trash2, Save, Layers, FileText, BookOpen, PenTool, FilePlus, ArrowLeft, Loader2, AlignLeft, Lightbulb,
  AlertCircle,
  CheckCircle2,
  X,
  Edit3,
  Image as ImageIcon, // Renamed to avoid conflict
  UploadCloud
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import TestGenerator from "./components/TestGenerator";

// Import Refactored Components
import ActivityBuilder from "./components/ActivityBuilder";
import WritingBuilder from "./components/WritingBuilder";
import { InputLabel, ThemedInput, ThemedTextarea, SidebarSkeleton } from "./components/SharedUI";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

// --- NEW COMPONENT: CIRCULAR PROGRESS LOADER ---
const CircularProgress = ({ percentage, size = 18, strokeWidth = 2.5 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-zinc-200 dark:text-zinc-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-indigo-600 dark:text-indigo-400 transition-all duration-200 ease-linear"
        />
      </svg>
    </div>
  );
};

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("chapter");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [chaptersList, setChaptersList] = useState([]);
  const [grammarList, setGrammarList] = useState([]);
  const [notification, setNotification] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showTestModal, setShowTestModal] = useState(false);

  // --- UPLOAD STATE ---
  // Stores which item is currently uploading (e.g., 'cover' or 'u-0-p-1') and the progress %
  const [uploadState, setUploadState] = useState({ target: null, progress: 0 });

  // --- Initial States ---
  const initialChapterState = {
    classLevel: 5,
    title: "",
    author: "",
    chapterNumber: 1,
    coverImage: "",
    units: [{ title: "Unit 1", paragraphs: [{ english: "", bengali: "", image: "" }], activities: [], writings: [] }],
  };

  const initialGrammarState = {
    topic: "",
    description: "",
    sections: [{ title: "Rule 1", content: "", examples: [{ sentence: "", explanation: "" }] }]
  };

  const [chapterForm, setChapterForm] = useState(initialChapterState);
  const [grammarForm, setGrammarForm] = useState(initialGrammarState);

  useEffect(() => { fetchData(); }, [activeTab]);

  async function fetchData() {
    setFetching(true);
    try {
        const endpoint = activeTab === "chapter" ? "/api/chapters" : "/api/grammar";
        const res = await fetch(endpoint);
        const data = await res.json();
        if (data.success) {
            activeTab === "chapter" ? setChaptersList(data.data || []) : setGrammarList(data.data || []);
        }
    } catch (error) { console.error(error); } finally { setFetching(false); }
  }

  // --- Helpers ---
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const resetForm = () => {
    setEditingId(null);
    activeTab === "chapter" ? setChapterForm(initialChapterState) : setGrammarForm(initialGrammarState);
  };

  const loadForEdit = (item) => {
    setEditingId(item._id);
    if (activeTab === "chapter") {
        const safeItem = {
            ...item,
            coverImage: item.coverImage || "",
            units: item.units?.map(u => ({
                ...u,
                paragraphs: u.paragraphs?.map(p => ({ ...p, image: p.image || "" })) || [],
                activities: u.activities?.map(a => ({
                    ...a,
                    questions: a.questions || [],
                    columnHeaders: a.columnHeaders || []
                })) || [],
                writings: u.writings || []
            })) || []
        };
        setChapterForm(safeItem);
    } else {
        setGrammarForm({ ...item });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- CLOUDINARY UPLOAD WITH PROGRESS ---
  const uploadToCloudinary = (file, targetId) => {
    return new Promise((resolve, reject) => {
      if (!file) return reject("No file");

      if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.NEXT_PUBLIC_CLOUDINARY_PRESET) {
          showNotification('error', 'Cloudinary keys missing');
          return reject("Config missing");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`);

      // Track Progress
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadState({ target: targetId, progress: percent });
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          setUploadState({ target: null, progress: 0 }); // Reset on success
          resolve(data.secure_url);
        } else {
          setUploadState({ target: null, progress: 0 });
          reject("Upload failed");
        }
      };

      xhr.onerror = () => {
        setUploadState({ target: null, progress: 0 });
        reject("Network error");
      };

      xhr.send(formData);
    });
  };

  // --- HANDLERS ---
  const handleCoverImageUpload = async (file) => {
      try {
          const url = await uploadToCloudinary(file, 'cover');
          setChapterForm(prev => ({ ...prev, coverImage: url }));
      } catch (e) {
          showNotification('error', 'Failed to upload cover image');
      }
  };

  const handleParagraphImageUpload = async (unitIdx, pIdx, file) => {
      const targetId = `u-${unitIdx}-p-${pIdx}`;
      try {
          const url = await uploadToCloudinary(file, targetId);
          updateParagraph(unitIdx, pIdx, 'image', url);
      } catch (e) {
          showNotification('error', 'Failed to upload image');
      }
  };

  // =========================================================================
  // CORE HANDLERS: UNIT & PARAGRAPHS
  // =========================================================================

  const addUnit = () => setChapterForm({ ...chapterForm, units: [...chapterForm.units, { title: `Unit ${chapterForm.units.length + 1}`, paragraphs: [], activities: [], writings: [] }] });
  const updateUnitTitle = (i, v) => { const u = [...chapterForm.units]; u[i].title = v; setChapterForm({ ...chapterForm, units: u }); };
  const removeUnit = (i) => { const u = [...chapterForm.units]; u.splice(i, 1); setChapterForm({ ...chapterForm, units: u }); };

  const addParagraph = (i) => { const u = [...chapterForm.units]; u[i].paragraphs.push({english:"",bengali:"", image: ""}); setChapterForm({...chapterForm, units:u}); };
  const updateParagraph = (i, p, f, v) => { const u = [...chapterForm.units]; u[i].paragraphs[p][f] = v; setChapterForm({...chapterForm, units:u}); };
  const removeParagraph = (i, p) => { const u = [...chapterForm.units]; u[i].paragraphs.splice(p, 1); setChapterForm({...chapterForm, units:u}); };

  // =========================================================================
  // BRIDGE HANDLERS: ACTIVITIES (Passed to Child Component)
  // =========================================================================

  const addActivityGroup = (unitIdx, type) => {
      const u = [...chapterForm.units];
      if (!u[unitIdx].activities) u[unitIdx].activities = [];

      const defaultInstr = {
          MCQ: "Choose the correct answer:",
          TRUE_FALSE: "Write 'T' for true and 'F' for false:",
          MATCHING: "Match Column A with Column B:",
          FILL_BLANKS: "Fill in the blanks:",
          WORD_BOX: "Fill in the blanks using words from the box:",
          REARRANGE: "Rearrange the following sentences:",
          UNDERLINE: "Underline the correct words:",
          UNDERLINE_CIRCLE: "Underline countable nouns and Circle uncountable nouns:",
          CATEGORIZE: "Put the underlined words in the correct columns:",
          CAUSE_EFFECT: "Complete the table:",
          QA: "Answer the following questions:"
      };

      u[unitIdx].activities.push({
          type,
          instruction: defaultInstr[type] || "Complete the activity:",
          questions: [],
          columnHeaders: []
      });
      setChapterForm({ ...chapterForm, units: u });
  };

  const updateActivity = (unitIdx, actIdx, newActivity) => {
      const u = [...chapterForm.units];
      u[unitIdx].activities[actIdx] = newActivity;
      setChapterForm({ ...chapterForm, units: u });
  };

  const removeActivity = (unitIdx, actIdx) => {
      const u = [...chapterForm.units];
      u[unitIdx].activities.splice(actIdx, 1);
      setChapterForm({ ...chapterForm, units: u });
  };

  // =========================================================================
  // BRIDGE HANDLERS: WRITING SKILLS (Passed to Child Component)
  // =========================================================================

  const addWritingTask = (unitIdx, type) => {
      const u = [...chapterForm.units];
      if (!u[unitIdx].writings) u[unitIdx].writings = [];

      let initialData = { wordLimit: "100 words" };
      let defaultQuestion = "Write a...";

      if (type === 'FAMILY_CHART') {
          defaultQuestion = "Describe the relationships based on the chart.";
          initialData = {
              familyMembers: [{
                  id: "root", parentId: null, partnerId: null,
                  name: "Grandfather", relation: "Head", details: "Age 70"
              }]
          };
      } else if (['STORY', 'PARAGRAPH', 'NOTICE'].includes(type)) {
          initialData.hints = ["Point 1", "Point 2"];
      } else if (type === 'DIALOGUE') {
          defaultQuestion = "Write a dialogue between...";
          initialData.characters = ["Person A", "Person B"];
          initialData.setting = "Scene context...";
      } else if (type === 'SUMMARY') {
          defaultQuestion = "Write a summary of the following passage.";
          initialData.passage = "Paste text here...";
          initialData.wordLimit = "Approx. 50 words";
      }

      u[unitIdx].writings.push({
          type: type,
          question: defaultQuestion,
          data: initialData,
          modelAnswer: ""
      });
      setChapterForm({ ...chapterForm, units: u });
  };

  const updateWriting = (unitIdx, wIdx, newWriting) => {
      const u = [...chapterForm.units];
      u[unitIdx].writings[wIdx] = newWriting;
      setChapterForm({ ...chapterForm, units: u });
  };

  const removeWriting = (unitIdx, wIdx) => {
      const u = [...chapterForm.units];
      u[unitIdx].writings.splice(wIdx, 1);
      setChapterForm({ ...chapterForm, units: u });
  };

  // =========================================================================
  // HANDLERS: GRAMMAR
  // =========================================================================
  const addGrammarSection = () => setGrammarForm({ ...grammarForm, sections: [...grammarForm.sections, { title: `Rule ${grammarForm.sections.length + 1}`, content: "", examples: [] }] });
  const removeGrammarSection = (i) => { const s = [...grammarForm.sections]; s.splice(i, 1); setGrammarForm({ ...grammarForm, sections: s }); };
  const updateSection = (i, f, v) => { const s = [...grammarForm.sections]; s[i][f] = v; setGrammarForm({ ...grammarForm, sections: s }); };
  const addExample = (i) => { const s = [...grammarForm.sections]; s[i].examples.push({ sentence: "", explanation: "" }); setGrammarForm({ ...grammarForm, sections: s }); };
  const updateExample = (sI, eI, f, v) => { const s = [...grammarForm.sections]; s[sI].examples[eI][f] = v; setGrammarForm({ ...grammarForm, sections: s }); };
  const removeExample = (sI, eI) => { const s = [...grammarForm.sections]; s[sI].examples.splice(eI, 1); setGrammarForm({ ...grammarForm, sections: s }); };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadState.target) {
        showNotification("error", "Please wait for uploads to finish.");
        return;
    }
    setLoading(true);
    const method = editingId ? "PUT" : "POST";
    const endpoint = activeTab === "chapter" ? "/api/chapters" : "/api/grammar";
    let payload = activeTab === "chapter" ? chapterForm : grammarForm;
    if (editingId) payload = { ...payload, _id: editingId };
    try {
      const res = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) { showNotification('success', 'Saved Successfully'); if(!editingId) resetForm(); fetchData(); } else { showNotification('error', data.error); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-200 font-sans selection:bg-zinc-300 dark:selection:bg-zinc-700">

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-40 border-b border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-xl transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="p-2 -ml-2 text-zinc-500 hover:text-black dark:hover:text-white rounded-full transition-colors"><ArrowLeft size={20} /></Link>
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <button onClick={() => { setActiveTab("chapter"); resetForm(); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === "chapter" ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}><BookOpen size={14} /> Literature</button>
                <button onClick={() => { setActiveTab("grammar"); resetForm(); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === "grammar" ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}><PenTool size={14} /> Grammar</button>
            </div>
          </div>
          <div className='flex items-center justify-center gap-2'>
            <button
                onClick={() => setShowTestModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-200"
            >
                <FileText size={14} /><span>Test Mode</span>
            </button>
            <button onClick={resetForm} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${!editingId ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-black dark:hover:text-white'}`}><FilePlus size={14} /><span>New {activeTab === "chapter" ? "Chapter" : "Topic"}</span></button>

            <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-2 text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Sidebar */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
                <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar">
                    {fetching ? (
                        <SidebarSkeleton />
                    ) : (
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {((activeTab === "chapter" ? chaptersList : grammarList) || []).length === 0 ? (
                                <div className="p-8 text-center text-zinc-500 text-xs py-12">No items found</div>
                            ) : (
                                (activeTab === "chapter" ? chaptersList : grammarList).map((item) => (
                                    <button key={item._id} onClick={() => loadForEdit(item)} className={`w-full text-left p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all flex items-center justify-between group ${editingId === item._id ? 'bg-zinc-50 dark:bg-zinc-800/80 border-l-4 border-zinc-900 dark:border-zinc-100' : 'border-l-4 border-transparent'}`}>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400`}>
                                                        {activeTab === "chapter" ? `Cl ${item.classLevel}` : 'Ref'}
                                                    </span>
                                                </div>
                                                <h3 className={`text-sm font-medium line-clamp-1 transition-colors ${editingId === item._id ? 'text-black dark:text-white' : 'text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white'}`}>{activeTab === "chapter" ? item.title : item.topic}</h3>
                                            </div>
                                            <Edit3 size={14} className={`transition-opacity ${editingId === item._id ? 'text-black dark:text-white opacity-100' : 'text-zinc-400 opacity-0 group-hover:opacity-100'}`} />
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Form */}
            <div className="lg:col-span-8">
                <form onSubmit={handleSubmit} className="space-y-10">

                    {activeTab === "chapter" && (
                        <AnimatePresence mode="wait">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">

                                {/* 1. Metadata */}
                                <section className="bg-white dark:bg-zinc-900/10 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                                        <FileText size={16} className="text-zinc-400"/>
                                        <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Chapter Metadata</h2>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                        <div className="col-span-1"><InputLabel>Class Level</InputLabel><ThemedInput type="number" value={chapterForm.classLevel} onChange={(e) => setChapterForm({...chapterForm, classLevel: e.target.value})} /></div>
                                        <div className="col-span-1"><InputLabel>Chapter No.</InputLabel><ThemedInput type="number" value={chapterForm.chapterNumber} onChange={(e) => setChapterForm({...chapterForm, chapterNumber: e.target.value})} /></div>
                                        <div className="col-span-2"><InputLabel>Author Name</InputLabel><ThemedInput value={chapterForm.author} onChange={(e) => setChapterForm({...chapterForm, author: e.target.value})} /></div>
                                        <div className="col-span-4"><InputLabel>Chapter Title</InputLabel><ThemedInput value={chapterForm.title} onChange={(e) => setChapterForm({...chapterForm, title: e.target.value})} className="text-lg font-medium" /></div>

                                        {/* Cover Image Upload */}
                                        <div className="col-span-4">
                                            <InputLabel>Cover Image (Optional)</InputLabel>
                                            <div className="flex items-center gap-4 mt-2">
                                                {chapterForm.coverImage && (
                                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 group">
                                                        <img src={chapterForm.coverImage} alt="Cover" className="w-full h-full object-cover"/>
                                                        <button type="button" onClick={() => setChapterForm(prev => ({...prev, coverImage: ""}))} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"><Trash2 size={16}/></button>
                                                    </div>
                                                )}
                                                <label className={`flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg cursor-pointer transition-colors text-xs font-bold text-zinc-600 dark:text-zinc-300 ${uploadState.target ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    {/* GEMINI-LIKE LOADER */}
                                                    {uploadState.target === 'cover' ? (
                                                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                                            <CircularProgress percentage={uploadState.progress} />
                                                            <span>{uploadState.progress}%</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <UploadCloud size={14}/>
                                                            <span>{chapterForm.coverImage ? "Change Cover" : "Upload Cover"}</span>
                                                        </>
                                                    )}
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCoverImageUpload(e.target.files[0])} disabled={!!uploadState.target} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* 2. Units Loop */}
                                {chapterForm.units?.map((unit, uIdx) => (
                                    <motion.div key={uIdx} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 relative shadow-sm dark:shadow-none">
                                            <div className="flex gap-4 mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                                                <div className="flex-1"><InputLabel>Unit Title</InputLabel><ThemedInput value={unit.title} onChange={(e) => updateUnitTitle(uIdx, e.target.value)} /></div>
                                                <button type="button" onClick={() => removeUnit(uIdx)} className="mt-6 p-2 text-zinc-400 hover:text-black dark:hover:text-white rounded-lg transition-colors"><Trash2 size={18} /></button>
                                            </div>

                                            {/* Paragraphs */}
                                            <div className="space-y-5 mb-8">
                                                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><AlignLeft size={14}/> Text Content</h3>
                                                {unit.paragraphs?.map((p, pIdx) => (
                                                    <div key={pIdx} className="space-y-3 group bg-zinc-50/50 dark:bg-zinc-900/20 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                                                        <div className="grid md:grid-cols-2 gap-4">
                                                            <ThemedTextarea value={p.english} onChange={(e) => updateParagraph(uIdx, pIdx, 'english', e.target.value)} placeholder="English text..." />
                                                            <div className="relative">
                                                                <ThemedTextarea value={p.bengali} onChange={(e) => updateParagraph(uIdx, pIdx, 'bengali', e.target.value)} placeholder="Bengali translation..." />
                                                                <button type="button" onClick={() => removeParagraph(uIdx, pIdx)} className="absolute top-2 right-2 p-1 text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-all"><X size={14}/></button>
                                                            </div>
                                                        </div>
                                                        {/* Paragraph Image Upload */}
                                                        <div className="flex items-center gap-3 pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                                                            {p.image ? (
                                                                <div className="flex items-center gap-3 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                                                                    <img src={p.image} alt="Paragraph visual" className="w-12 h-12 object-cover rounded-md"/>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Image Attached</span>
                                                                        <button type="button" onClick={() => updateParagraph(uIdx, pIdx, 'image', "")} className="text-[10px] text-red-500 hover:underline text-left">Remove</button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <label className={`flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md cursor-pointer hover:border-zinc-400 transition-all text-[10px] font-bold text-zinc-500 hover:text-black dark:hover:text-white ${uploadState.target ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                                    {/* GEMINI-LIKE LOADER */}
                                                                    {uploadState.target === `u-${uIdx}-p-${pIdx}` ? (
                                                                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                                                            <CircularProgress percentage={uploadState.progress} size={14} strokeWidth={2} />
                                                                            <span>{uploadState.progress}%</span>
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            <ImageIcon size={12}/>
                                                                            <span>Add Illustration</span>
                                                                        </>
                                                                    )}
                                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleParagraphImageUpload(uIdx, pIdx, e.target.files[0])} disabled={!!uploadState.target} />
                                                                </label>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => addParagraph(uIdx)} className="w-full py-2.5 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-500 hover:text-black dark:hover:text-white hover:border-zinc-400 transition-colors">+ Add Paragraph Block</button>
                                            </div>

                                            {/* Activities */}
                                            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/50 mb-8">
                                                <div className="flex justify-between items-center mb-6">
                                                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Layers size={14}/> Interactive Activities</h3>
                                                    <div className="group relative z-20">
                                                        <button type="button" className="text-xs font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"><Plus size={14}/> Add Activity</button>
                                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 flex flex-col p-1 transform origin-top-right scale-95 group-hover:scale-100 max-h-60 overflow-y-auto custom-scrollbar">
                                                            {['MCQ', 'TRUE_FALSE', 'MATCHING', 'FILL_BLANKS', 'WORD_BOX', 'REARRANGE', 'UNDERLINE', 'UNDERLINE_CIRCLE', 'CATEGORIZE', 'CAUSE_EFFECT', 'QA', 'CHART_FILL'].map(type => (
                                                                <button key={type} type="button" onClick={() => addActivityGroup(uIdx, type)} className="text-left px-3 py-2 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-300 flex items-center gap-2 hover:text-black dark:hover:text-white">
                                                                    {type.replace('_', ' ')}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    {unit.activities?.map((act, actIdx) => (
                                                        <ActivityBuilder
                                                            key={actIdx}
                                                            unitIdx={uIdx}
                                                            actIdx={actIdx}
                                                            activity={act}
                                                            onChange={(newAct) => updateActivity(uIdx, actIdx, newAct)}
                                                            onRemove={() => removeActivity(uIdx, actIdx)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Writing Skills */}
                                            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
                                                <div className="flex justify-between items-center mb-6">
                                                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><PenTool size={14}/> Writing Studio</h3>
                                                    <div className="group relative z-20">
                                                        <button type="button" className="text-xs font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"><Plus size={14}/> Add Writing Task</button>
                                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 flex flex-col p-1 transform origin-top-right scale-95 group-hover:scale-100 max-h-60 overflow-y-auto custom-scrollbar">
                                                            {['PARAGRAPH', 'STORY', 'NOTICE', 'FAMILY_CHART', 'FORMAL_LETTER', 'INFORMAL_LETTER', 'PROCESS', 'DIARY', 'DIALOGUE', 'SUMMARY'].map(type => (
                                                                <button key={type} type="button" onClick={() => addWritingTask(uIdx, type)} className="text-left px-3 py-2 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white">
                                                                    {type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    {unit.writings?.map((write, wIdx) => (
                                                        <WritingBuilder
                                                            key={wIdx}
                                                            unitIdx={uIdx}
                                                            wIdx={wIdx}
                                                            writing={write}
                                                            onChange={(newWrite) => updateWriting(uIdx, wIdx, newWrite)}
                                                            onRemove={() => removeWriting(uIdx, wIdx)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                    </motion.div>
                                ))}

                                <button type="button" onClick={addUnit} className="w-full py-6 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-black dark:hover:text-white transition-all flex flex-col items-center gap-2">
                                    <Plus size={24} /> <span className="text-sm font-bold">Create New Unit</span>
                                </button>
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {/* Grammar Form */}
                    {activeTab === "grammar" && (
                        <AnimatePresence mode="wait">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">
                                <section className="bg-white dark:bg-zinc-900/10 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                                        <PenTool size={16} className="text-zinc-400"/>
                                        <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Grammar Topic</h2>
                                    </div>
                                    <div className="grid grid-cols-1 gap-5">
                                        <div><InputLabel>Topic Title</InputLabel><ThemedInput value={grammarForm.topic} onChange={(e) => setGrammarForm({...grammarForm, topic: e.target.value})} /></div>
                                        <div><InputLabel>Description</InputLabel><ThemedTextarea value={grammarForm.description} onChange={(e) => setGrammarForm({...grammarForm, description: e.target.value})} placeholder="Brief description of the grammar topic..." /></div>
                                    </div>
                                </section>

                                {grammarForm.sections.map((sec, idx) => (
                                    <motion.div key={idx} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 relative">
                                            <div className="flex gap-4 mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                                <div className="flex-1"><InputLabel>Rule Title</InputLabel><ThemedInput value={sec.title} onChange={(e) => updateSection(idx, 'title', e.target.value)} /></div>
                                                <button type="button" onClick={() => removeGrammarSection(idx)} className="mt-6 p-2 text-zinc-400 hover:text-black dark:hover:text-white"><Trash2 size={18} /></button>
                                            </div>
                                            <div className="mb-6"><InputLabel>Explanation</InputLabel><ThemedTextarea value={sec.content} onChange={(e) => updateSection(idx, 'content', e.target.value)} /></div>

                                            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1"><Lightbulb size={12}/> Examples</span>
                                                    <button type="button" onClick={() => addExample(idx)} className="text-[10px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-black dark:hover:text-white shadow-sm">+ Add</button>
                                                </div>
                                                <div className="space-y-3">
                                                    {sec.examples.map((ex, exIdx) => (
                                                        <div key={exIdx} className="flex gap-2 items-start">
                                                            <div className="flex-1 grid gap-2">
                                                                <input className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1.5 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500" placeholder="Sentence..." value={ex.sentence} onChange={(e) => updateExample(idx, exIdx, 'sentence', e.target.value)} />
                                                                <input className="w-full bg-transparent border-b border-dashed border-zinc-300 dark:border-zinc-700 px-2 py-1 text-xs text-zinc-500 outline-none" placeholder="Why is this correct? (Optional)" value={ex.explanation} onChange={(e) => updateExample(idx, exIdx, 'explanation', e.target.value)} />
                                                            </div>
                                                            <button type="button" onClick={() => removeExample(idx, exIdx)} className="p-1 text-zinc-400 hover:text-black dark:hover:text-white"><Trash2 size={14} /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                    </motion.div>
                                ))}
                                <button type="button" onClick={addGrammarSection} className="w-full py-4 border border-dashed border-zinc-300 rounded-xl text-zinc-500 text-sm hover:bg-zinc-50 hover:text-black transition-colors">+ Add New Rule</button>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </form>
            </div>
        </div>
      </main>

      {/* Floating Save Bar */}
      <motion.div initial={{y:100}} animate={{y:0}} className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-2 pl-6 rounded-full shadow-2xl flex items-center gap-4 pointer-events-auto">
            <span className="text-xs text-zinc-500 font-medium hidden sm:inline">{editingId ? "Updating Content..." : "Creating New Content..."}</span>
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 hidden sm:block"></div>
            <button onClick={handleSubmit} disabled={loading || !!uploadState.target} className={`flex items-center gap-2 px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-full hover:scale-105 active:scale-95 transition-all ${loading || !!uploadState.target ? 'opacity-80 cursor-not-allowed' : ''}`}>
                {loading || !!uploadState.target ? <Loader2 size={16} className="animate-spin"/> : <Save size={16} />}
                <span>{editingId ? 'Update Changes' : 'Publish Now'}</span>
            </button>
        </div>
      </motion.div>

      {/* Toast Notification (Monochrome) */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{opacity:0, y:20}}
            animate={{opacity:1, y:0}}
            exit={{opacity:0, y:20}}
            className={`fixed bottom-24 right-6 z-50 px-4 py-3 rounded-lg shadow-xl backdrop-blur-md flex items-center gap-2 text-sm font-bold border ${notification.type === 'success' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black border-zinc-900 dark:border-zinc-100' : 'bg-white text-zinc-900 dark:bg-black dark:text-white border-zinc-200 dark:border-zinc-800'}`}
          >
            {notification.type === 'success' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Generator Modal */}
      {showTestModal && (
        <TestGenerator
          chaptersList={chaptersList}
          grammarList={grammarList}
          onClose={() => setShowTestModal(false)}
        />
      )}
    </div>
  );
}
