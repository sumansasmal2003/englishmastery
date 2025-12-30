"use client";
import { useState, useEffect } from "react";
import {
  BookOpen, PenTool, FilePlus, ArrowLeft, Loader2, Save, LogOut,
  AlertCircle, CheckCircle2, LayoutGrid, Edit3, FileText, Feather
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";

import TestGenerator from "./components/TestGenerator";
import { SidebarSkeleton } from "./components/SharedUI";
import ChapterEditor from "@/components/admin/ChapterEditor";
import GrammarEditor from "@/components/admin/GrammarEditor";
import WritingManager from "@/components/admin/WritingManager"; // Import the new manager
import ClassManager from "@/components/admin/ClassManager";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("chapter");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Data State
  const [chaptersList, setChaptersList] = useState([]);
  const [grammarList, setGrammarList] = useState([]);
  const [classInfos, setClassInfos] = useState([]);

  // UI State
  const [notification, setNotification] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [uploadState, setUploadState] = useState({ target: null, progress: 0 });

  // Form State
  const initialChapterState = {
    classLevel: 3,
    title: "",
    author: "",
    chapterNumber: 1,
    coverImage: "",
    units: [{ title: "Unit 1", paragraphs: [{ english: "", bengali: "", image: "" }], activities: [], writings: [] }],
  };

  const initialGrammarState = {
    topic: "",
    description: "",
    coverImage: "",
    sections: [{ title: "Rule 1", content: "", examples: [{ sentence: "", explanation: "" }] }]
  };

  const [chapterForm, setChapterForm] = useState(initialChapterState);
  const [grammarForm, setGrammarForm] = useState(initialGrammarState);

  // Fetch Data on Tab Change (Only for Chapter/Grammar/Class)
  useEffect(() => {
      if(activeTab !== 'writing') fetchData();
  }, [activeTab]);

  async function fetchData() {
    setFetching(true);
    try {
        let endpoint = "";
        if (activeTab === "chapter") endpoint = "/api/chapters";
        else if (activeTab === "grammar") endpoint = "/api/grammar";
        else if (activeTab === "classes") endpoint = "/api/classes";
        else return; // Writing handles its own fetching

        const res = await fetch(endpoint);
        const data = await res.json();
        if (data.success) {
            if (activeTab === "chapter") setChaptersList(data.data || []);
            else if (activeTab === "grammar") setGrammarList(data.data || []);
            else setClassInfos(data.data || []);
        }
    } catch (error) { console.error(error); } finally { setFetching(false); }
  }

  // --- ACTIONS ---
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
        setGrammarForm({ ...item, coverImage: item.coverImage || "" });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      if (data.success) {
        showNotification('success', 'Saved Successfully');
        if(!editingId) resetForm();
        fetchData();
      } else {
        showNotification('error', data.error);
      }
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
                <button onClick={() => { setActiveTab("writing"); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === "writing" ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}><Feather size={14} /> Writing</button>
                <button onClick={() => { setActiveTab("classes"); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === "classes" ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}><LayoutGrid size={14} /> Classes</button>
            </div>
          </div>
          <div className='flex items-center justify-center gap-2'>
            <button onClick={() => setShowTestModal(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-200">
                <FileText size={14} /><span>Test Mode</span>
            </button>

            {activeTab !== 'classes' && activeTab !== 'writing' && (
                <button onClick={resetForm} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${!editingId ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-black dark:hover:text-white'}`}><FilePlus size={14} /><span>New {activeTab === "chapter" ? "Chapter" : "Topic"}</span></button>
            )}

            <button onClick={() => signOut({ callbackUrl: '/login' })} className="p-2 text-zinc-500 hover:text-black dark:hover:text-white transition-colors" title="Sign Out">
                <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32">
        {activeTab === 'classes' ? (
             <ClassManager
                classInfos={classInfos}
                onRefresh={fetchData}
                uploadState={uploadState}
                setUploadState={setUploadState}
                showNotification={showNotification}
             />
        ) : activeTab === 'writing' ? (
            <WritingManager showNotification={showNotification} />
        ) : (
            /* --- CHAPTER & GRAMMAR EDITORS VIEW --- */
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

                {/* Main Form Area */}
                <div className="lg:col-span-8">
                    <form onSubmit={handleSubmit}>
                        {activeTab === "chapter" && (
                            <ChapterEditor
                                form={chapterForm}
                                setForm={setChapterForm}
                                uploadState={uploadState}
                                setUploadState={setUploadState}
                                showNotification={showNotification}
                            />
                        )}
                        {activeTab === "grammar" && (
                            <GrammarEditor
                                form={grammarForm}
                                setForm={setGrammarForm}
                                uploadState={uploadState}
                                setUploadState={setUploadState}
                                showNotification={showNotification}
                            />
                        )}
                    </form>
                </div>
            </div>
        )}
      </main>

      {/* Floating Save Bar - ONLY SHOW FOR CHAPTER/GRAMMAR */}
      {activeTab !== 'classes' && activeTab !== 'writing' && (
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
      )}

      {/* Toast Notification */}
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
