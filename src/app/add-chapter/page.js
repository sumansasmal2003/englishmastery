"use client";
import { useState, useEffect } from "react";
import {
  Plus, Trash2, Save, Layers, FileText, User, ArrowLeft, CheckCircle2,
  AlertCircle, Edit3, RefreshCw, FilePlus, BookOpen, PenTool, X,
  Lightbulb, ListChecks, CheckSquare, AlignLeft, SplitSquareHorizontal,
  Loader2, ArrowDownUp, Type, BoxSelect, Highlighter, Table2, Feather, Network, Heart,
  ArrowRightLeft
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// --- Styled Components ---
const InputLabel = ({ children, icon: Icon }) => (
  <label className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-2">
    {Icon && <Icon size={12} />}
    {children}
  </label>
);

const ThemedInput = ({ ...props }) => (
  <input
    {...props}
    className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-sm dark:shadow-none"
  />
);

const ThemedTextarea = ({ ...props }) => (
  <textarea
    {...props}
    className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 resize-none min-h-[100px] shadow-sm dark:shadow-none"
  />
);

const ActivityBadge = ({ type }) => {
    const config = {
        MCQ: { color: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20", label: "Multiple Choice" },
        TRUE_FALSE: { color: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-500/20", label: "True / False" },
        MATCHING: { color: "bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400 border-pink-200 dark:border-pink-500/20", label: "Matching" },
        FILL_BLANKS: { color: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20", label: "Fill Blanks" },
        WORD_BOX: { color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20", label: "Word Box" },
        REARRANGE: { color: "bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 border-teal-200 dark:border-teal-500/20", label: "Rearrange" },
        UNDERLINE: { color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20", label: "Underline" },
        UNDERLINE_CIRCLE: { color: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20", label: "Underline & Circle" },
        CATEGORIZE: { color: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20", label: "Column Sort" },
        CAUSE_EFFECT: { color: "bg-lime-100 text-lime-700 dark:bg-lime-500/10 dark:text-lime-400 border-lime-200 dark:border-lime-500/20", label: "Cause & Effect" },
        QA: { color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700", label: "Q & A" }
    };
    const { color, label } = config[type] || config.QA;
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${color}`}>{label}</span>;
};

// --- Skeleton Component ---
const SidebarSkeleton = () => (
    <div className="space-y-3 p-4">
        {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-center justify-between">
                <div className="space-y-2 w-full">
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3"></div>
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
                </div>
            </div>
        ))}
    </div>
);

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("chapter");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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
    units: [{ title: "Unit 1", paragraphs: [{ english: "", bengali: "" }], activities: [], writings: [] }],
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
            units: item.units?.map(u => ({
                ...u,
                paragraphs: u.paragraphs || [],
                activities: u.activities?.map(a => ({
                    ...a,
                    questions: a.questions || []
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

  // =========================================================================
  // HANDLERS: CHAPTER & ACTIVITIES
  // =========================================================================

  const addUnit = () => setChapterForm({ ...chapterForm, units: [...chapterForm.units, { title: `Unit ${chapterForm.units.length + 1}`, paragraphs: [], activities: [], writings: [] }] });
  const updateUnitTitle = (i, v) => { const u = [...chapterForm.units]; u[i].title = v; setChapterForm({ ...chapterForm, units: u }); };
  const removeUnit = (i) => { const u = [...chapterForm.units]; u.splice(i, 1); setChapterForm({ ...chapterForm, units: u }); };

  const addParagraph = (i) => { const u = [...chapterForm.units]; u[i].paragraphs.push({english:"",bengali:""}); setChapterForm({...chapterForm, units:u}); };
  const updateParagraph = (i, p, f, v) => { const u = [...chapterForm.units]; u[i].paragraphs[p][f] = v; setChapterForm({...chapterForm, units:u}); };
  const removeParagraph = (i, p) => { const u = [...chapterForm.units]; u[i].paragraphs.splice(p, 1); setChapterForm({...chapterForm, units:u}); };

  // --- ACTIVITY LOGIC ---
  const getDefaultInstruction = (type) => {
      const instr = {
          MCQ: "Choose the correct answer:",
          TRUE_FALSE: "Write 'T' for true and 'F' for false:",
          MATCHING: "Match Column A with Column B:",
          FILL_BLANKS: "Fill in the blanks:",
          WORD_BOX: "Fill in the blanks using words from the box:",
          REARRANGE: "Rearrange the following sentences:",
          UNDERLINE: "Underline the correct words:",
          UNDERLINE_CIRCLE: "Underline countable nouns and Circle uncountable nouns:",
          CATEGORIZE: "Put the underlined words in the correct columns:",
          CAUSE_EFFECT: "Complete the Cause and Effect table:",
          QA: "Answer the following questions:"
      };
      return instr[type] || "Complete the activity:";
  };

  const addActivityGroup = (unitIdx, type) => {
      const u = [...chapterForm.units];
      if (!u[unitIdx].activities) u[unitIdx].activities = [];
      u[unitIdx].activities.push({ type, instruction: getDefaultInstruction(type), questions: [] });
      setChapterForm({ ...chapterForm, units: u });
  };

  const removeActivityGroup = (unitIdx, actIdx) => {
      const u = [...chapterForm.units];
      u[unitIdx].activities.splice(actIdx, 1);
      setChapterForm({ ...chapterForm, units: u });
  };

  const updateActivityInstruction = (unitIdx, actIdx, val) => {
      const u = [...chapterForm.units];
      u[unitIdx].activities[actIdx].instruction = val;
      setChapterForm({ ...chapterForm, units: u });
  };

  const addQuestion = (unitIdx, actIdx) => {
      const u = [...chapterForm.units];
      const type = u[unitIdx].activities[actIdx].type;

      let q = { text: "" };
      if (type === 'MCQ') q = { text: "", options: ["", "", "", ""], correctAnswer: "" };
      if (type === 'TRUE_FALSE') q = { text: "", isTrue: false, supportingStatement: "" };
      if (type === 'MATCHING') q = { leftItem: "", rightItem: "" };
      if (type === 'FILL_BLANKS' || type === 'QA') q = { text: "", correctAnswer: "" };
      if (type === 'REARRANGE') q = { text: "", options: ["", "", ""] };
      if (type === 'UNDERLINE') q = { text: "" };
      if (type === 'UNDERLINE_CIRCLE') q = { text: "" };
      if (type === 'WORD_BOX') q = { text: "", correctAnswer: "" };
      if (type === 'CATEGORIZE') q = { text: "", options: ["Column 1", "Column 2"] };
      if (type === 'CAUSE_EFFECT') q = { leftItem: "", rightItem: "", options: ["EFFECT"] }; // options[0] stores which one is Hidden (The question)

      if (!u[unitIdx].activities[actIdx].questions) u[unitIdx].activities[actIdx].questions = [];
      u[unitIdx].activities[actIdx].questions.push(q);
      setChapterForm({ ...chapterForm, units: u });
  };

  const updateQuestion = (unitIdx, actIdx, qIdx, field, val) => {
      const u = [...chapterForm.units];
      u[unitIdx].activities[actIdx].questions[qIdx][field] = val;
      setChapterForm({ ...chapterForm, units: u });
  };

  // Special handler for "Word Box" and "Categorize"
  const updateGlobalOptions = (unitIdx, actIdx, val) => {
      const u = [...chapterForm.units];
      const items = val.split(',').map(w => w.trim()).filter(w => w !== "");
      u[unitIdx].activities[actIdx].questions.forEach(q => { q.options = items; });
      setChapterForm({ ...chapterForm, units: u });
  };

  // Special handler for Cause/Effect Toggle (Which side is the blank?)
  const updateCauseEffectType = (unitIdx, actIdx, qIdx, hiddenSide) => {
      const u = [...chapterForm.units];
      // Safely ensure options exists
      if(!u[unitIdx].activities[actIdx].questions[qIdx].options) {
          u[unitIdx].activities[actIdx].questions[qIdx].options = [];
      }
      u[unitIdx].activities[actIdx].questions[qIdx].options[0] = hiddenSide;
      setChapterForm({ ...chapterForm, units: u });
  };

  const updateMCQOption = (unitIdx, actIdx, qIdx, optIdx, val) => {
      const u = [...chapterForm.units];
      u[unitIdx].activities[actIdx].questions[qIdx].options[optIdx] = val;
      setChapterForm({ ...chapterForm, units: u });
  };

  const updateOptionArray = (unitIdx, actIdx, qIdx, optIdx, val) => {
      const u = [...chapterForm.units];
      u[unitIdx].activities[actIdx].questions[qIdx].options[optIdx] = val;
      setChapterForm({ ...chapterForm, units: u });
  };

  const addOptionToQuestion = (unitIdx, actIdx, qIdx) => {
      const u = [...chapterForm.units];
      if (!u[unitIdx].activities[actIdx].questions[qIdx].options) u[unitIdx].activities[actIdx].questions[qIdx].options = [];
      u[unitIdx].activities[actIdx].questions[qIdx].options.push("");
      setChapterForm({ ...chapterForm, units: u });
  };

  const removeOptionFromQuestion = (unitIdx, actIdx, qIdx, optIdx) => {
      const u = [...chapterForm.units];
      u[unitIdx].activities[actIdx].questions[qIdx].options.splice(optIdx, 1);
      setChapterForm({ ...chapterForm, units: u });
  };

  const removeQuestion = (unitIdx, actIdx, qIdx) => {
      const u = [...chapterForm.units];
      u[unitIdx].activities[actIdx].questions.splice(qIdx, 1);
      setChapterForm({ ...chapterForm, units: u });
  };

  // =========================================================================
  // HANDLERS: WRITING SKILLS & FAMILY TREE
  // =========================================================================

  const addWritingTask = (unitIdx, type) => {
      const u = [...chapterForm.units];
      if (!u[unitIdx].writings) u[unitIdx].writings = [];

      let initialData = { wordLimit: "100 words" };
      if (type === 'FAMILY_CHART') {
          initialData = {
              familyMembers: [{
                  id: "root",
                  parentId: null,
                  partnerId: null,
                  name: "Grandfather",
                  relation: "Head",
                  details: "Age 70"
              }]
          };
      } else if (['STORY', 'PARAGRAPH', 'NOTICE'].includes(type)) {
          initialData.hints = ["Point 1", "Point 2"];
      }

      u[unitIdx].writings.push({
          type: type,
          question: type === 'FAMILY_CHART' ? "Describe the relationships..." : "Write a...",
          data: initialData,
          modelAnswer: ""
      });
      setChapterForm({ ...chapterForm, units: u });
  };

  const removeWritingTask = (unitIdx, wIdx) => {
      const u = [...chapterForm.units];
      u[unitIdx].writings.splice(wIdx, 1);
      setChapterForm({ ...chapterForm, units: u });
  };

  const updateWritingField = (unitIdx, wIdx, field, val) => {
      const u = [...chapterForm.units];
      u[unitIdx].writings[wIdx][field] = val;
      setChapterForm({ ...chapterForm, units: u });
  };

  const updateWritingData = (unitIdx, wIdx, key, val) => {
      const u = [...chapterForm.units];
      if (!u[unitIdx].writings[wIdx].data) u[unitIdx].writings[wIdx].data = {};

      if (key === 'hints') {
          u[unitIdx].writings[wIdx].data[key] = val.split(',').map(s => s.trim());
      } else {
          u[unitIdx].writings[wIdx].data[key] = val;
      }
      setChapterForm({ ...chapterForm, units: u });
  };

  // --- FAMILY TREE HANDLERS ---
  const addFamilyMemberNode = (unitIdx, wIdx, parentId) => {
      const u = [...chapterForm.units];
      const newId = `mem-${Date.now()}`;
      if (!u[unitIdx].writings[wIdx].data.familyMembers) u[unitIdx].writings[wIdx].data.familyMembers = [];
      u[unitIdx].writings[wIdx].data.familyMembers.push({
          id: newId, parentId: parentId, partnerId: null, name: "", relation: "", details: ""
      });
      setChapterForm({ ...chapterForm, units: u });
  };

  const addSpouseNode = (unitIdx, wIdx, partnerId) => {
      const u = [...chapterForm.units];
      const newId = `mem-${Date.now()}`;
      const members = u[unitIdx].writings[wIdx].data.familyMembers;

      const newSpouse = {
          id: newId,
          parentId: 'spouse',
          partnerId: partnerId,
          name: "", relation: "Wife/Husband", details: ""
      };

      const originalNode = members.find(m => m.id === partnerId);
      if (originalNode) originalNode.partnerId = newId;

      members.push(newSpouse);
      setChapterForm({ ...chapterForm, units: u });
  };

  const updateFamilyMemberNode = (unitIdx, wIdx, memberId, field, val) => {
      const u = [...chapterForm.units];
      const members = u[unitIdx].writings[wIdx].data.familyMembers;
      const index = members.findIndex(m => m.id === memberId);
      if (index !== -1) {
          members[index][field] = val;
          setChapterForm({ ...chapterForm, units: u });
      }
  };

  const removeFamilyMemberNode = (unitIdx, wIdx, memberId) => {
      const u = [...chapterForm.units];
      let members = u[unitIdx].writings[wIdx].data.familyMembers;

      const node = members.find(m => m.id === memberId);
      if(node && node.partnerId) {
          const partner = members.find(p => p.id === node.partnerId);
          if(partner) partner.partnerId = null;
      }

      const idsToDelete = [memberId];
      let foundMore = true;
      while(foundMore) {
          foundMore = false;
          members.forEach(m => {
              if (idsToDelete.includes(m.parentId) && !idsToDelete.includes(m.id)) {
                  idsToDelete.push(m.id);
                  foundMore = true;
              }
          });
      }
      u[unitIdx].writings[wIdx].data.familyMembers = members.filter(m => !idsToDelete.includes(m.id));
      setChapterForm({ ...chapterForm, units: u });
  };

  const renderAdminTree = (unitIdx, wIdx, parentId = null) => {
      const members = chapterForm.units[unitIdx].writings[wIdx].data.familyMembers || [];
      const children = members.filter(m => m.parentId === parentId && m.parentId !== 'spouse');

      if (children.length === 0 && parentId === null) return <div className="text-zinc-400 text-xs">No members. Add a root.</div>;

      return (
          <div className="flex gap-8 justify-center pt-4">
              {children.map((member) => {
                  const spouse = members.find(m => m.id === member.partnerId);
                  return (
                      <div key={member.id} className="flex flex-col items-center">
                          <div className="flex gap-2 items-center mb-6 relative">
                              {/* Primary Node Card */}
                              <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 rounded-xl shadow-sm w-40 relative group/node">
                                  <button type="button" onClick={() => removeFamilyMemberNode(unitIdx, wIdx, member.id)} className="absolute -top-2 -right-2 bg-red-100 text-red-500 p-1 rounded-full opacity-0 group-hover/node:opacity-100 transition-opacity z-20"><X size={10}/></button>
                                  <div className="space-y-2">
                                      <input className="w-full text-xs font-bold bg-transparent outline-none border-b border-transparent focus:border-indigo-300 text-zinc-900 dark:text-zinc-100" placeholder="Name" value={member.name} onChange={(e) => updateFamilyMemberNode(unitIdx, wIdx, member.id, 'name', e.target.value)} />
                                      <input className="w-full text-[10px] text-zinc-500 bg-transparent outline-none" placeholder="Relation" value={member.relation} onChange={(e) => updateFamilyMemberNode(unitIdx, wIdx, member.id, 'relation', e.target.value)} />
                                      <input className="w-full text-[10px] text-zinc-400 bg-transparent outline-none" placeholder="Details" value={member.details} onChange={(e) => updateFamilyMemberNode(unitIdx, wIdx, member.id, 'details', e.target.value)} />
                                  </div>
                                  <div className="flex gap-1 mt-2">
                                      <button type="button" onClick={() => addFamilyMemberNode(unitIdx, wIdx, member.id)} className="flex-1 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold rounded hover:bg-indigo-100">+ Child</button>
                                      {!spouse && <button type="button" onClick={() => addSpouseNode(unitIdx, wIdx, member.id)} className="flex-1 py-1 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-[9px] font-bold rounded hover:bg-pink-100">+ Partner</button>}
                                  </div>
                              </div>
                              {/* Spouse Node Card */}
                              {spouse && (
                                  <>
                                      <div className="h-px w-4 bg-pink-300"></div>
                                      <div className="bg-pink-50/50 dark:bg-pink-900/10 border border-pink-200 dark:border-pink-800 p-3 rounded-xl shadow-sm w-40 relative group/spouse">
                                          <button type="button" onClick={() => removeFamilyMemberNode(unitIdx, wIdx, spouse.id)} className="absolute -top-2 -right-2 bg-red-100 text-red-500 p-1 rounded-full opacity-0 group-hover/spouse:opacity-100 transition-opacity z-20"><X size={10}/></button>
                                          <div className="space-y-2">
                                              <input className="w-full text-xs font-bold bg-transparent outline-none border-b border-transparent focus:border-pink-300 text-zinc-900 dark:text-zinc-100" placeholder="Spouse Name" value={spouse.name} onChange={(e) => updateFamilyMemberNode(unitIdx, wIdx, spouse.id, 'name', e.target.value)} />
                                              <input className="w-full text-[10px] text-zinc-500 bg-transparent outline-none" placeholder="Relation" value={spouse.relation} onChange={(e) => updateFamilyMemberNode(unitIdx, wIdx, spouse.id, 'relation', e.target.value)} />
                                              <input className="w-full text-[10px] text-zinc-400 bg-transparent outline-none" placeholder="Details" value={spouse.details} onChange={(e) => updateFamilyMemberNode(unitIdx, wIdx, spouse.id, 'details', e.target.value)} />
                                          </div>
                                      </div>
                                  </>
                              )}
                          </div>
                          {members.some(m => m.parentId === member.id) && (
                              <div className="relative w-full">
                                  <div className="absolute left-1/2 -translate-x-1/2 -top-6 w-px h-6 bg-zinc-300 dark:bg-zinc-700"></div>
                                  <div className="border-t border-zinc-300 dark:border-zinc-700 w-full mb-4"></div>
                                  {renderAdminTree(unitIdx, wIdx, member.id)}
                              </div>
                          )}
                      </div>
                  );
              })}
          </div>
      );
  };

  // ... (Grammar Handlers and Submit) ...
  const addGrammarSection = () => setGrammarForm({ ...grammarForm, sections: [...grammarForm.sections, { title: `Rule ${grammarForm.sections.length + 1}`, content: "", examples: [] }] });
  const removeGrammarSection = (i) => { const s = [...grammarForm.sections]; s.splice(i, 1); setGrammarForm({ ...grammarForm, sections: s }); };
  const updateSection = (i, f, v) => { const s = [...grammarForm.sections]; s[i][f] = v; setGrammarForm({ ...grammarForm, sections: s }); };
  const addExample = (i) => { const s = [...grammarForm.sections]; s[i].examples.push({ sentence: "", explanation: "" }); setGrammarForm({ ...grammarForm, sections: s }); };
  const updateExample = (sI, eI, f, v) => { const s = [...grammarForm.sections]; s[sI].examples[eI][f] = v; setGrammarForm({ ...grammarForm, sections: s }); };
  const removeExample = (sI, eI) => { const s = [...grammarForm.sections]; s[sI].examples.splice(eI, 1); setGrammarForm({ ...grammarForm, sections: s }); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    const method = editingId ? "PUT" : "POST";
    const endpoint = activeTab === "chapter" ? "/api/chapters" : "/api/grammar";
    let payload = activeTab === "chapter" ? chapterForm : grammarForm;
    if (editingId) payload = { ...payload, _id: editingId };
    try {
      const res = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) { showNotification('success', 'Saved!'); if(!editingId) resetForm(); fetchData(); } else { showNotification('error', data.error); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-200 font-sans selection:bg-indigo-500/30">

      <header className="fixed top-0 inset-x-0 z-40 border-b border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-full transition-colors"><ArrowLeft size={20} /></Link>
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <button onClick={() => { setActiveTab("chapter"); resetForm(); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === "chapter" ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}><BookOpen size={14} /> Literature</button>
                <button onClick={() => { setActiveTab("grammar"); resetForm(); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === "grammar" ? 'bg-white dark:bg-zinc-800 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}><PenTool size={14} /> Grammar</button>
            </div>
          </div>
          <button onClick={resetForm} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${!editingId ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-indigo-500'}`}><FilePlus size={14} /><span>New {activeTab === "chapter" ? "Chapter" : "Topic"}</span></button>
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
                                    <button key={item._id} onClick={() => loadForEdit(item)} className={`w-full text-left p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all flex items-center justify-between group ${editingId === item._id ? 'bg-indigo-50 dark:bg-indigo-500/10 border-l-4 border-indigo-500' : 'border-l-4 border-transparent'}`}>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeTab === "chapter" ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500' : 'bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'}`}>
                                                    {activeTab === "chapter" ? `Cl ${item.classLevel}` : 'Ref'}
                                                </span>
                                            </div>
                                            <h3 className={`text-sm font-medium line-clamp-1 transition-colors ${editingId === item._id ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-700 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white'}`}>{activeTab === "chapter" ? item.title : item.topic}</h3>
                                        </div>
                                        <Edit3 size={14} className={`transition-opacity ${editingId === item._id ? 'text-indigo-500 opacity-100' : 'text-zinc-400 opacity-0 group-hover:opacity-100'}`} />
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
                                {/* Metadata */}
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
                                    </div>
                                </section>

                                {chapterForm.units?.map((unit, uIdx) => (
                                    <motion.div key={uIdx} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 relative shadow-sm dark:shadow-none">
                                        <div className="flex gap-4 mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                                            <div className="flex-1"><InputLabel>Unit Title</InputLabel><ThemedInput value={unit.title} onChange={(e) => updateUnitTitle(uIdx, e.target.value)} /></div>
                                            <button type="button" onClick={() => removeUnit(uIdx)} className="mt-6 p-2 text-zinc-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                        </div>

                                        <div className="space-y-5 mb-8">
                                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><AlignLeft size={14}/> Text Content</h3>
                                            {unit.paragraphs?.map((p, pIdx) => (
                                                <div key={pIdx} className="grid md:grid-cols-2 gap-4 group">
                                                    <ThemedTextarea value={p.english} onChange={(e) => updateParagraph(uIdx, pIdx, 'english', e.target.value)} placeholder="English text..." />
                                                    <div className="relative">
                                                        <ThemedTextarea value={p.bengali} onChange={(e) => updateParagraph(uIdx, pIdx, 'bengali', e.target.value)} placeholder="Bengali translation..." />
                                                        <button type="button" onClick={() => removeParagraph(uIdx, pIdx)} className="absolute top-2 right-2 p-1 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => addParagraph(uIdx)} className="w-full py-2.5 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-500 hover:text-indigo-500">+ Add Paragraph Block</button>
                                        </div>

                                        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/50 mb-8">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Layers size={14}/> Interactive Activities</h3>
                                                <div className="group relative">
                                                    <button type="button" className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-indigo-100 transition-colors"><Plus size={14}/> Add Activity</button>
                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 flex flex-col p-1 transform origin-top-right scale-95 group-hover:scale-100">
                                                        {['MCQ', 'TRUE_FALSE', 'MATCHING', 'FILL_BLANKS', 'WORD_BOX', 'REARRANGE', 'UNDERLINE', 'UNDERLINE_CIRCLE', 'CATEGORIZE', 'CAUSE_EFFECT', 'QA'].map(type => (
                                                            <button key={type} type="button" onClick={() => addActivityGroup(uIdx, type)} className="text-left px-3 py-2 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                                                                {type === 'MCQ' && <ListChecks size={12}/>}
                                                                {type === 'CAUSE_EFFECT' && <ArrowRightLeft size={12}/>}
                                                                {type.replace('_', ' ')}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                {unit.activities?.map((act, actIdx) => (
                                                    <div key={actIdx} className="bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-700/50 rounded-xl p-5 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex-1 mr-4">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <ActivityBadge type={act.type} />
                                                                    <span className="text-[10px] text-zinc-400 font-mono">{(act.questions || []).length} Items</span>
                                                                </div>
                                                                <input className="w-full bg-transparent border-b border-dashed border-zinc-300 dark:border-zinc-600 text-xs text-zinc-600 dark:text-zinc-400 focus:outline-none focus:border-indigo-500 py-1" value={act.instruction} onChange={(e) => updateActivityInstruction(uIdx, actIdx, e.target.value)} />
                                                            </div>
                                                            <button type="button" onClick={() => removeActivityGroup(uIdx, actIdx)} className="text-zinc-400 hover:text-red-500 p-1 rounded"><Trash2 size={14} /></button>
                                                        </div>

                                                        {/* --- SPECIAL INPUT: WORD BOX --- */}
                                                        {act.type === 'WORD_BOX' && (
                                                            <div className="mb-4">
                                                                <InputLabel>Word List (Comma separated)</InputLabel>
                                                                <ThemedInput placeholder="apple, banana, orange..." value={(act.questions?.[0]?.options || []).join(', ')} onChange={(e) => updateGlobalOptions(uIdx, actIdx, e.target.value)} />
                                                            </div>
                                                        )}

                                                        {/* --- SPECIAL INPUT: CATEGORIZE --- */}
                                                        {act.type === 'CATEGORIZE' && (
                                                            <div className="mb-4 space-y-2">
                                                                <InputLabel>Column Headers (Comma separated)</InputLabel>
                                                                <ThemedInput placeholder="Countable Nouns, Uncountable Nouns..." value={(act.questions?.[0]?.options || []).join(', ')} onChange={(e) => updateGlobalOptions(uIdx, actIdx, e.target.value)} />
                                                                <p className="text-[10px] text-zinc-400">Use syntax <code>{`{word|0}`}</code> for 1st column.</p>
                                                            </div>
                                                        )}

                                                        <div className="space-y-3 pl-3 border-l-2 border-zinc-200 dark:border-zinc-700">
                                                            {(act.questions || []).map((q, qIdx) => (
                                                                <div key={qIdx} className="relative group/q bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                                                    <button type="button" onClick={() => removeQuestion(uIdx, actIdx, qIdx)} className="absolute top-2 right-2 text-zinc-300 hover:text-red-400 opacity-0 group-hover/q:opacity-100 transition-opacity"><X size={12} /></button>

                                                                    {/* DYNAMIC FIELDS */}
                                                                    {act.type === 'MCQ' && (
                                                                        <div className="space-y-2.5">
                                                                            <input className="w-full text-sm font-medium bg-transparent outline-none placeholder:text-zinc-300" placeholder="Question Text..." value={q.text} onChange={(e) => updateQuestion(uIdx, actIdx, qIdx, 'text', e.target.value)} />
                                                                            <div className="grid grid-cols-2 gap-2">
                                                                                {(q.options || []).map((opt, optIdx) => (
                                                                                    <div key={optIdx} className="flex items-center gap-2">
                                                                                        <div onClick={() => updateQuestion(uIdx, actIdx, qIdx, 'correctAnswer', opt)} className={`w-3.5 h-3.5 rounded-full border cursor-pointer transition-colors ${q.correctAnswer === opt && opt !== "" ? 'bg-green-500 border-green-500 ring-2 ring-green-100 dark:ring-green-900' : 'border-zinc-300 dark:border-zinc-600 hover:border-indigo-400'}`}></div>
                                                                                        <input className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1.5 rounded border border-transparent focus:border-zinc-200 dark:focus:border-zinc-700 outline-none" placeholder={`Option ${optIdx + 1}`} value={opt} onChange={(e) => { updateMCQOption(uIdx, actIdx, qIdx, optIdx, e.target.value); if(q.correctAnswer === opt) updateQuestion(uIdx, actIdx, qIdx, 'correctAnswer', e.target.value); }} />
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {act.type === 'REARRANGE' && (
                                                                        <div className="space-y-2">
                                                                            <input className="w-full text-sm font-medium bg-transparent outline-none placeholder:text-zinc-300" placeholder="Context / Title (Optional)" value={q.text} onChange={(e) => updateQuestion(uIdx, actIdx, qIdx, 'text', e.target.value)} />
                                                                            <div className="space-y-2">
                                                                                <p className="text-[10px] text-zinc-400 font-bold uppercase">Correct Sequence:</p>
                                                                                {(q.options || []).map((line, lIdx) => (
                                                                                    <div key={lIdx} className="flex items-center gap-2">
                                                                                        <span className="text-[10px] text-zinc-400 font-mono w-4">{lIdx+1}.</span>
                                                                                        <input className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 px-2 py-1.5 rounded border border-transparent focus:border-zinc-300 outline-none" value={line} onChange={(e) => updateOptionArray(uIdx, actIdx, qIdx, lIdx, e.target.value)} placeholder={`Sentence ${lIdx+1}`} />
                                                                                        <button type="button" onClick={() => removeOptionFromQuestion(uIdx, actIdx, qIdx, lIdx)} className="text-zinc-300 hover:text-red-500"><X size={12}/></button>
                                                                                    </div>
                                                                                ))}
                                                                                <button type="button" onClick={() => addOptionToQuestion(uIdx, actIdx, qIdx)} className="text-[10px] text-indigo-500 font-bold hover:underline">+ Add Line</button>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {act.type === 'TRUE_FALSE' && (
                                                                        <div className="flex gap-4 items-start">
                                                                            <div className="flex-1 space-y-2">
                                                                                 <input className="w-full text-sm bg-transparent outline-none" placeholder="Statement..." value={q.text} onChange={(e) => updateQuestion(uIdx, actIdx, qIdx, 'text', e.target.value)} />
                                                                                 <input className="w-full text-xs text-zinc-500 bg-transparent outline-none" placeholder="Supporting statement..." value={q.supportingStatement} onChange={(e) => updateQuestion(uIdx, actIdx, qIdx, 'supportingStatement', e.target.value)} />
                                                                            </div>
                                                                            <button type="button" onClick={() => updateQuestion(uIdx, actIdx, qIdx, 'isTrue', !q.isTrue)} className={`px-4 py-1.5 rounded text-xs font-bold transition-colors ${q.isTrue ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{q.isTrue ? "TRUE" : "FALSE"}</button>
                                                                        </div>
                                                                    )}

                                                                    {act.type === 'MATCHING' && (
                                                                        <div className="flex gap-4 items-center">
                                                                            <input className="flex-1 text-xs bg-zinc-50 dark:bg-zinc-800 p-2 rounded outline-none" placeholder="Left Item (A)" value={q.leftItem} onChange={(e) => updateQuestion(uIdx, actIdx, qIdx, 'leftItem', e.target.value)} />
                                                                            <ArrowLeft size={12} className="text-zinc-300" />
                                                                            <input className="flex-1 text-xs bg-zinc-50 dark:bg-zinc-800 p-2 rounded outline-none" placeholder="Right Match (B)" value={q.rightItem} onChange={(e) => updateQuestion(uIdx, actIdx, qIdx, 'rightItem', e.target.value)} />
                                                                        </div>
                                                                    )}

                                                                    {act.type === 'UNDERLINE' && (
                                                                        <div className="space-y-2">
                                                                            <input className="w-full text-sm font-medium bg-transparent outline-none placeholder:text-zinc-300" placeholder="Sentence (e.g. The {cat} is sleeping)" value={q.text} onChange={(e) => updateQuestion(uIdx, actIdx, qIdx, 'text', e.target.value)} />
                                                                            <p className="text-[10px] text-zinc-400">Wrap correct words in {`{ }`}</p>
                                                                        </div>
                                                                    )}

                                                                    {act.type === 'UNDERLINE_CIRCLE' && (
                                                                        <div className="space-y-2">
                                                                            <input className="w-full text-sm font-medium bg-transparent outline-none placeholder:text-zinc-300" placeholder="Sentence (e.g. {Apple} is tasty but [Milk] is not)" value={q.text} onChange={(e) => updateQuestion(uIdx, actIdx, qIdx, 'text', e.target.value)} />
                                                                            <p className="text-[10px] text-zinc-400 flex gap-3"><span>Underline: {`{word}`}</span><span>Circle: {`[word]`}</span></p>
                                                                        </div>
                                                                    )}

                                                                    {act.type === 'CATEGORIZE' && (
                                                                        <div className="space-y-2">
                                                                            <input className="w-full text-sm font-medium bg-transparent outline-none placeholder:text-zinc-300" placeholder="Sentence (e.g. The {cat|0} drank {milk|1})" value={q.text} onChange={(e) => updateQuestion(uIdx, actIdx, qIdx, 'text', e.target.value)} />
                                                                        </div>
                                                                    )}

                                                                    {act.type === 'CAUSE_EFFECT' && (
                                                                        <div className="space-y-3">
                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                <div className="flex flex-col gap-1">
                                                                                    <div className="flex justify-between items-center">
                                                                                        <span className="text-[10px] font-bold text-zinc-400">CAUSE</span>
                                                                                        <button type="button" onClick={() => updateCauseEffectType(uIdx, actIdx, qIdx, 'CAUSE')} className={`text-[9px] px-2 py-0.5 rounded border ${q.options?.[0] === 'CAUSE' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-zinc-50 border-zinc-200 text-zinc-400'}`}>
                                                                                            {q.options?.[0] === 'CAUSE' ? 'Question (Blank)' : 'Visible'}
                                                                                        </button>
                                                                                    </div>
                                                                                    <ThemedTextarea className="min-h-[50px] text-xs" placeholder="Enter Cause..." value={q.leftItem} onChange={(e) => updateQuestion(uIdx, actIdx, qIdx, 'leftItem', e.target.value)} />
                                                                                </div>
                                                                                <div className="flex flex-col gap-1">
                                                                                    <div className="flex justify-between items-center">
                                                                                        <span className="text-[10px] font-bold text-zinc-400">EFFECT</span>
                                                                                        <button type="button" onClick={() => updateCauseEffectType(uIdx, actIdx, qIdx, 'EFFECT')} className={`text-[9px] px-2 py-0.5 rounded border ${q.options?.[0] === 'EFFECT' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-zinc-50 border-zinc-200 text-zinc-400'}`}>
                                                                                            {q.options?.[0] === 'EFFECT' ? 'Question (Blank)' : 'Visible'}
                                                                                        </button>
                                                                                    </div>
                                                                                    <ThemedTextarea className="min-h-[50px] text-xs" placeholder="Enter Effect..." value={q.rightItem} onChange={(e) => updateQuestion(uIdx, actIdx, qIdx, 'rightItem', e.target.value)} />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {(act.type === 'FILL_BLANKS' || act.type === 'QA' || act.type === 'WORD_BOX') && (
                                                                        <div className="space-y-2">
                                                                            <input className="w-full text-sm bg-transparent outline-none" placeholder={act.type === 'QA' ? "Question..." : "Sentence with blank..."} value={q.text} onChange={(e) => updateQuestion(uIdx, actIdx, qIdx, 'text', e.target.value)} />
                                                                            <input className="w-full text-xs bg-emerald-50 dark:bg-emerald-900/10 px-2 py-1 rounded outline-none text-emerald-700 placeholder:text-emerald-700/50" placeholder="Correct Answer..." value={q.correctAnswer} onChange={(e) => updateQuestion(uIdx, actIdx, qIdx, 'correctAnswer', e.target.value)} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            <button type="button" onClick={() => addQuestion(uIdx, actIdx)} className="text-xs text-zinc-400 hover:text-zinc-600 flex items-center gap-1">+ Add Question Row</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* WRITING SKILLS STUDIO */}
                                        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Feather size={14}/> Writing Studio</h3>
                                                <div className="group relative">
                                                    <button type="button" className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-rose-100 transition-colors"><Plus size={14}/> Add Writing Task</button>
                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 flex flex-col p-1 transform origin-top-right scale-95 group-hover:scale-100 max-h-60 overflow-y-auto custom-scrollbar">
                                                        {['PARAGRAPH', 'STORY', 'NOTICE', 'FAMILY_CHART', 'FORMAL_LETTER', 'INFORMAL_LETTER', 'PROCESS', 'DIARY'].map(type => (
                                                            <button key={type} type="button" onClick={() => addWritingTask(uIdx, type)} className="text-left px-3 py-2 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-300">
                                                                {type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                {unit.writings?.map((write, wIdx) => (
                                                    <div key={wIdx} className="bg-rose-50/30 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-xl p-5 hover:border-rose-300 dark:hover:border-rose-800 transition-colors">

                                                        {/* Header */}
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex-1 mr-4">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400">
                                                                        {write.type.replace(/_/g, ' ')}
                                                                    </span>
                                                                </div>
                                                                <input className="w-full bg-transparent border-b border-dashed border-rose-200 dark:border-rose-800 text-sm font-medium text-rose-900 dark:text-rose-200 focus:outline-none focus:border-rose-500 py-1" value={write.question} onChange={(e) => updateWritingField(uIdx, wIdx, 'question', e.target.value)} placeholder="Enter the main question prompt..." />
                                                            </div>
                                                            <button type="button" onClick={() => removeWritingTask(uIdx, wIdx)} className="text-rose-400 hover:text-rose-600 p-1 rounded"><Trash2 size={14} /></button>
                                                        </div>

                                                        {/* --- FAMILY CHART BUILDER --- */}
                                                        {write.type === 'FAMILY_CHART' ? (
                                                            <div className="mb-6 bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
                                                                <div className="flex justify-between items-center mb-4">
                                                                    <span className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-2"><Network size={12}/> Family Tree</span>
                                                                    <span className="text-[10px] text-zinc-400">Add descendants or partners</span>
                                                                </div>

                                                                <div className="min-w-max pb-4">
                                                                    {renderAdminTree(uIdx, wIdx, null)}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            /* 2. STANDARD TEXT INPUTS (Story, Paragraph, etc) */
                                                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                                                {['STORY', 'PARAGRAPH', 'NOTICE', 'PROCESS'].includes(write.type) && (
                                                                    <div className="col-span-2">
                                                                        <InputLabel>Hints / Outlines (Comma separated)</InputLabel>
                                                                        <ThemedTextarea
                                                                            value={(write.data?.hints || []).join(', ')}
                                                                            onChange={(e) => updateWritingData(uIdx, wIdx, 'hints', e.target.value)}
                                                                            placeholder="Point 1, Point 2, Point 3..."
                                                                            className="min-h-[60px]"
                                                                        />
                                                                    </div>
                                                                )}

                                                                {write.type.includes('LETTER') && (
                                                                    <>
                                                                        <div><InputLabel>Sender's Address</InputLabel><ThemedInput placeholder="Optional" value={write.data?.senderAddress || ''} onChange={(e) => updateWritingData(uIdx, wIdx, 'senderAddress', e.target.value)} /></div>
                                                                        <div><InputLabel>Receiver's Address</InputLabel><ThemedInput placeholder="Optional" value={write.data?.receiverAddress || ''} onChange={(e) => updateWritingData(uIdx, wIdx, 'receiverAddress', e.target.value)} /></div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Model Answer (Common) */}
                                                        <div>
                                                            <InputLabel>Model Answer / Solution</InputLabel>
                                                            <ThemedTextarea
                                                                value={write.modelAnswer}
                                                                onChange={(e) => updateWritingField(uIdx, wIdx, 'modelAnswer', e.target.value)}
                                                                placeholder="Write the full answer here..."
                                                                className="min-h-[120px] font-serif"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                    </motion.div>
                                ))}
                                <button type="button" onClick={addUnit} className="w-full py-6 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 flex flex-col items-center gap-2">
                                    <Plus size={24} /> <span className="text-sm font-bold">Create New Unit</span>
                                </button>
                            </motion.div>
                        </AnimatePresence>
                    )}
                    {/* ... (Grammar Mode) ... */}
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
                                            <button type="button" onClick={() => removeGrammarSection(idx)} className="mt-6 p-2 text-zinc-400 hover:text-red-500"><Trash2 size={18} /></button>
                                        </div>
                                        <div className="mb-6"><InputLabel>Explanation</InputLabel><ThemedTextarea value={sec.content} onChange={(e) => updateSection(idx, 'content', e.target.value)} /></div>

                                        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1"><Lightbulb size={12}/> Examples</span>
                                                <button type="button" onClick={() => addExample(idx)} className="text-[10px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded hover:text-emerald-500 shadow-sm">+ Add</button>
                                            </div>
                                            <div className="space-y-3">
                                                {sec.examples.map((ex, exIdx) => (
                                                    <div key={exIdx} className="flex gap-2 items-start">
                                                        <div className="flex-1 grid gap-2">
                                                            <input className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1.5 text-sm outline-none focus:border-indigo-500" placeholder="Sentence..." value={ex.sentence} onChange={(e) => updateExample(idx, exIdx, 'sentence', e.target.value)} />
                                                            <input className="w-full bg-transparent border-b border-dashed border-zinc-300 dark:border-zinc-700 px-2 py-1 text-xs text-zinc-500 outline-none" placeholder="Why is this correct? (Optional)" value={ex.explanation} onChange={(e) => updateExample(idx, exIdx, 'explanation', e.target.value)} />
                                                        </div>
                                                        <button type="button" onClick={() => removeExample(idx, exIdx)} className="p-1 text-zinc-400 hover:text-red-500"><Trash2 size={14} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                <button type="button" onClick={addGrammarSection} className="w-full py-4 border border-dashed border-zinc-300 rounded-xl text-zinc-500 text-sm hover:bg-zinc-50">+ Add New Rule</button>
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
            <button onClick={handleSubmit} disabled={loading} className={`flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black text-sm font-bold rounded-full hover:scale-105 active:scale-95 transition-all ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}>
                {loading ? <Loader2 size={16} className="animate-spin"/> : <Save size={16} />}
                <span>{editingId ? 'Update Changes' : 'Publish Now'}</span>
            </button>
        </div>
      </motion.div>

      {/* Toast Notification */}
      <AnimatePresence>
        {notification && <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:20}} className={`fixed bottom-24 right-6 z-50 px-4 py-3 rounded-lg shadow-xl backdrop-blur-md flex items-center gap-2 text-sm font-medium border ${notification.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'}`}>{notification.type === 'success' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}{notification.message}</motion.div>}
      </AnimatePresence>
    </div>
  );
}
