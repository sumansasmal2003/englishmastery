import { useState, useEffect, useMemo } from "react";
import {
    X, ChevronRight, FileText, Layers, Plus, Trash2, Printer,
    ArrowLeft, BookOpen, PenTool, Eye, MoveUp, MoveDown, Sparkles, Loader2, RefreshCw, Save, FolderOpen, Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { InputLabel, ThemedInput, ThemedTextarea } from "./SharedUI";
import DeleteTestButton from "@/components/DeleteTestButton";

// --- CONSTANTS ---
const SECTION_TYPES = {
    SEEN: { label: "Seen Passage", icon: BookOpen, defaultTitle: "Reading Comprehension (Seen)" },
    UNSEEN: { label: "Unseen Passage", icon: Eye, defaultTitle: "Reading Comprehension (Unseen)" },
    GRAMMAR: { label: "Grammar & Vocab", icon: Layers, defaultTitle: "Grammar & Vocabulary" },
    WRITING: { label: "Writing Skills", icon: PenTool, defaultTitle: "Writing Skills" }
};

const QUESTION_TYPES = [
    { id: 'MCQ', label: 'Multiple Choice (MCQ)', marks: 1, defaultInst: "Choose the correct option:" },
    { id: 'SAQ', label: 'Short Answer (VSA)', marks: 1, defaultInst: "Answer the following questions in one sentence:" },
    { id: 'LAQ', label: 'Long Answer (LA)', marks: 2, defaultInst: "Answer the following questions briefly:" },
    { id: 'TF', label: 'True / False', marks: 1, defaultInst: "State whether the following are True or False:" },
    { id: 'FILL', label: 'Fill in the Blanks', marks: 1, defaultInst: "Fill in the blanks with suitable words:" },
];

// --- PDF STYLES ---
const pdfStyles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', fontSize: 11, lineHeight: 1.4 },
    header: { marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#000', textAlign: 'center' },
    title: { fontSize: 16, textTransform: 'uppercase', marginBottom: 5, fontWeight: 'bold' },
    subHeader: { flexDirection: 'row', justifyContent: 'space-between', fontSize: 10, fontWeight: 'bold' },
    section: { marginBottom: 15 },
    sectionTitle: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 5, backgroundColor: '#f0f0f0', padding: 3, textAlign: 'center' },
    passage: { fontSize: 9, marginBottom: 8, textAlign: 'justify', fontStyle: 'italic', borderLeftWidth: 2, borderLeftColor: '#ccc', paddingLeft: 8, color: '#444' },
    groupContainer: { marginBottom: 10 },
    groupHeader: { flexDirection: 'row', marginBottom: 4 },
    groupNum: { fontWeight: 'bold', width: 25, fontSize: 11 },
    groupInst: { fontWeight: 'bold', fontSize: 11, flex: 1 },
    questionRow: { flexDirection: 'row', marginBottom: 4, marginLeft: 15 },
    qAlpha: { width: 20, fontSize: 10, fontWeight: 'bold' },
    qContent: { flex: 1 },
    qText: { fontSize: 10 },
    qMarks: { fontSize: 9, fontWeight: 'bold', width: 20, textAlign: 'right' },
    optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2, marginLeft: 5 },
    optionItem: { width: '50%', fontSize: 9, color: '#333' },
});

// --- PDF COMPONENT ---
const TestDocument = ({ testPaper, contentPool, totalMarks }) => {
    let globalGroupCounter = 1;
    return (
        <Document>
            <Page size="A4" style={pdfStyles.page}>
                <View style={pdfStyles.header}>
                    <Text style={pdfStyles.title}>{testPaper.title}</Text>
                    <View style={pdfStyles.subHeader}>
                        <Text>Time: {testPaper.time}</Text>
                        {/* Auto-Calculated Total Marks */}
                        <Text>Total Marks: {totalMarks}</Text>
                    </View>
                </View>
                {testPaper.sections.map((section) => {
                    const passageObj = contentPool.find(c => c.id === section.contentId);
                    const passageText = section.type === 'SEEN'
                        ? (passageObj ? passageObj.text : "")
                        : (section.customText || "");

                    return (
                        <View key={section.id} style={pdfStyles.section}>
                            <Text style={pdfStyles.sectionTitle}>{section.title}</Text>
                            {passageText ? (
                                <View style={pdfStyles.passage}>
                                    {passageText.split('\n\n').map((p, i) => <Text key={i} style={{marginBottom: 4}}>{p}</Text>)}
                                </View>
                            ) : null}
                            {section.groups.map((group) => {
                                const currentGroupNum = globalGroupCounter++;
                                return (
                                    <View key={group.id} style={pdfStyles.groupContainer}>
                                        <View style={pdfStyles.groupHeader}>
                                            <Text style={pdfStyles.groupNum}>{currentGroupNum}.</Text>
                                            <Text style={pdfStyles.groupInst}>{group.instruction}</Text>
                                        </View>
                                        {group.questions.map((q, qIdx) => (
                                            <View key={qIdx} style={pdfStyles.questionRow}>
                                                <Text style={pdfStyles.qAlpha}>({String.fromCharCode(97 + qIdx)})</Text>
                                                <View style={pdfStyles.qContent}>
                                                    <Text style={pdfStyles.qText}>{q.text}</Text>
                                                    {group.type === 'MCQ' && (
                                                        <View style={pdfStyles.optionsGrid}>
                                                            {q.options?.map((opt, oIdx) => (
                                                                <Text key={oIdx} style={pdfStyles.optionItem}>({String.fromCharCode(65 + oIdx)}) {opt || "______"}</Text>
                                                            ))}
                                                        </View>
                                                    )}
                                                </View>
                                                <Text style={pdfStyles.qMarks}>[{q.marks}]</Text>
                                            </View>
                                        ))}
                                    </View>
                                );
                            })}
                        </View>
                    );
                })}
            </Page>
        </Document>
    );
};

export default function TestGenerator({ chaptersList, grammarList, onClose }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);


    // NEW: Manage "Create New" vs "Saved Papers"
    const [activeTab, setActiveTab] = useState('create');
    const [savedPapers, setSavedPapers] = useState([]);
    const [currentPaperId, setCurrentPaperId] = useState(null); // If editing a saved paper

    const handleDeleteSuccess = (deletedId) => {
        // Remove from list UI immediately
        setSavedPapers(prev => prev.filter(p => p._id !== deletedId));

        // If the user was currently editing the paper that got deleted, reset the editor
        if (currentPaperId === deletedId) {
            setCurrentPaperId(null);
            setTestPaper({ title: "English Class Test", time: "45 mins", sections: [] });
            setStep(1); // Go back to start
            alert("The paper you were editing has been deleted.");
        }
    };

    useEffect(() => {
        setIsClient(true);
        fetchSavedPapers();
    }, []);

    // --- SCOPE STATE ---
    const [scope, setScope] = useState({
        classLevel: "",
        selectedChapterIds: [],
        selectedUnitIndices: {}
    });

    const [contentPool, setContentPool] = useState([]);

    const [testPaper, setTestPaper] = useState({
        title: "English Class Test",
        time: "45 mins",
        sections: []
    });

    // --- AUTOMATIC MARKS CALCULATION ---
    const calculatedTotalMarks = useMemo(() => {
        return testPaper.sections.reduce((acc, s) =>
            acc + s.groups.reduce((gAcc, g) =>
                gAcc + g.questions.reduce((qAcc, q) => qAcc + parseFloat(q.marks || 0), 0)
            , 0)
        , 0);
    }, [testPaper.sections]);

    // --- API CALLS ---
    const fetchSavedPapers = async () => {
        try {
            const res = await fetch('/api/test-papers');
            const data = await res.json();
            if (data.papers) setSavedPapers(data.papers);
        } catch (e) {
            console.error("Failed to fetch saved papers", e);
        }
    };

    const handleLoadPaper = async (paperSummary) => {
        setLoading(true);
        try {
            // 1. Fetch full paper details
            const res = await fetch(`/api/test-papers/${paperSummary._id}`);
            const { paper } = await res.json();

            // 2. Set Basic State
            setCurrentPaperId(paper._id);
            setTestPaper({
                title: paper.title,
                time: paper.time,
                sections: paper.sections
            });

            // 3. Restore Scope & Rebuild Content Pool
            // We need to do this so SEEN passages work
            if (paper.scope) {
                setScope(paper.scope);
                await buildContentPool(paper.scope);
            }

            setStep(2); // Go to Builder
        } catch (e) {
            console.error(e);
            alert("Failed to load paper");
        } finally {
            setLoading(false);
        }
    };

    const handleSavePaper = async () => {
        const payload = {
            ...testPaper,
            totalMarks: calculatedTotalMarks, // Save the auto-calculated value
            classLevel: scope.classLevel, // Important for filtering
            scope: scope // Save scope to restore later
        };

        try {
            setLoading(true);
            const method = currentPaperId ? 'PUT' : 'POST';
            const url = currentPaperId ? `/api/test-papers/${currentPaperId}` : '/api/test-papers';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                alert("Paper Saved Successfully!");
                setCurrentPaperId(data.paper._id); // Update ID if it was a new create
                fetchSavedPapers(); // Refresh list
            } else {
                alert("Error saving: " + data.error);
            }
        } catch (e) {
            console.error(e);
            alert("Connection error");
        } finally {
            setLoading(false);
        }
    };

    // --- HELPER TO BUILD POOL ---
    const buildContentPool = async (currentScope) => {
        // Re-fetch chapters based on IDs to get text content
        const promises = currentScope.selectedChapterIds.map(id => fetch(`/api/chapters/${id}`).then(res => res.json()));
        const results = await Promise.all(promises);
        const loadedChapters = results.map(r => r.data).filter(Boolean);

        const pool = [];
        loadedChapters.forEach(chap => {
            const uIndices = currentScope.selectedUnitIndices[chap._id] || [];
            // Handle both Map and Object structure for indices
            // When coming from DB (JSON), Map becomes Object, so Object.values check might be needed if structure differs
            // Here we assume standard array behavior if restored correctly

            // Safe check for indices array
            const safeIndices = Array.isArray(uIndices) ? uIndices : [];
            const sortedIndices = [...safeIndices].sort((a, b) => a - b);

            if(sortedIndices.length > 0) {
                const mergedText = sortedIndices.map(uIdx => {
                    const unit = chap.units[uIdx];
                    return unit ? unit.paragraphs.map(p => p.english).join("\n\n") : "";
                }).join("\n\n");

                pool.push({
                    id: chap._id,
                    label: chap.title,
                    text: mergedText
                });
            }
        });
        setContentPool(pool);
    };

    // --- STEP 1: FETCH & MERGE CONTENT (For New Papers) ---
    const handleScopeSelection = async () => {
        setLoading(true);
        try {
            await buildContentPool(scope);

            // Initialize test paper if empty
            if(testPaper.sections.length === 0) {
                 const defaultSection = {
                    id: Date.now(),
                    type: 'SEEN',
                    title: String(SECTION_TYPES['SEEN'].defaultTitle),
                    contentId: "", // Will default to first in pool if needed
                    customText: "",
                    groups: []
                };
                setTestPaper(prev => ({ ...prev, sections: [defaultSection] }));
            }
            setCurrentPaperId(null); // Reset ID for new paper
            setStep(2);
        } catch (e) {
            console.error(e);
            alert("Error loading content");
        } finally {
            setLoading(false);
        }
    };

    // --- REORDERING LOGIC ---
    const moveChapterOrder = (index, direction) => {
        if((direction === -1 && index === 0) || (direction === 1 && index === scope.selectedChapterIds.length - 1)) return;
        const newIds = [...scope.selectedChapterIds];
        const temp = newIds[index];
        newIds[index] = newIds[index + direction];
        newIds[index + direction] = temp;
        setScope({ ...scope, selectedChapterIds: newIds });
    };

    // --- BUILDER HELPERS ---
    const addSection = (type) => {
        const newSection = {
            id: Date.now(),
            type,
            title: String(SECTION_TYPES[type]?.defaultTitle || "New Section"),
            contentId: "",
            customText: "",
            groups: []
        };
        if(type === 'WRITING') newSection.groups.push({
            id: Date.now()+1,
            type: 'WRITING_PROMPT',
            instruction: "Attempt the following writing skills:",
            questions: [{ text: "", marks: 5 }]
        });
        setTestPaper(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
    };

    const updateSection = (index, field, value) => {
        const newSecs = [...testPaper.sections];
        if (field === 'title' || field === 'customText') {
            newSecs[index][field] = String(value);
        } else {
            newSecs[index][field] = value;
        }
        setTestPaper({...testPaper, sections: newSecs});
    };

    const removeSection = (index) => {
        const newSecs = [...testPaper.sections];
        newSecs.splice(index, 1);
        setTestPaper({...testPaper, sections: newSecs});
    };

    const moveSection = (index, direction) => {
        if((direction === -1 && index === 0) || (direction === 1 && index === testPaper.sections.length - 1)) return;
        const newSecs = [...testPaper.sections];
        const temp = newSecs[index];
        newSecs[index] = newSecs[index + direction];
        newSecs[index + direction] = temp;
        setTestPaper({...testPaper, sections: newSecs});
    };

    const addGroup = (sectionIdx, typeId) => {
        const typeDef = QUESTION_TYPES.find(t => t.id === typeId);
        const newGroup = {
            id: Date.now(),
            type: typeId,
            instruction: typeDef?.defaultInst || "Answer the following:",
            questions: [{
                text: "",
                marks: typeDef?.marks || 1,
                options: typeId === 'MCQ' ? ["","","",""] : null
            }]
        };
        const newSecs = [...testPaper.sections];
        newSecs[sectionIdx].groups.push(newGroup);
        setTestPaper({ ...testPaper, sections: newSecs });
    };

    const updateGroup = (sectionIdx, groupIdx, newGroupData) => {
        const newSecs = [...testPaper.sections];
        newSecs[sectionIdx].groups[groupIdx] = newGroupData;
        setTestPaper({ ...testPaper, sections: newSecs });
    };

    const removeGroup = (sectionIdx, groupIdx) => {
        const newSecs = [...testPaper.sections];
        newSecs[sectionIdx].groups.splice(groupIdx, 1);
        setTestPaper({ ...testPaper, sections: newSecs });
    };

    // --- RENDERERS ---

    const renderSavedPapers = () => (
        <div className="h-full flex flex-col">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto p-1">
                {savedPapers.map(p => (
                    <div
                        key={p._id}
                        onClick={() => handleLoadPaper(p)}
                        className="relative cursor-pointer border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all group"
                    >
                         {/* DELETE BUTTON POSITIONED ABSOLUTE */}
                         <div
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()} // Prevent card click (Load Paper)
                         >
                            <DeleteTestButton
                                testPaperId={p._id}
                                onDeleteSuccess={handleDeleteSuccess}
                            />
                         </div>

                         <div className="flex justify-between items-start mb-2 pr-8"> {/* Added pr-8 to avoid overlap with delete button */}
                             <span className="px-2 py-1 text-[10px] font-bold bg-indigo-100 text-indigo-700 rounded uppercase">{p.classLevel}</span>
                         </div>
                         <h3 className="font-bold text-sm mb-1 group-hover:text-indigo-600 transition-colors">{p.title}</h3>
                         <div className="flex items-center gap-3 text-xs text-zinc-500 mt-2">
                             <span className="flex items-center gap-1"><Clock size={10}/> {new Date(p.createdAt).toLocaleDateString()}</span>
                             <span>•</span>
                             <span>Marks: {p.totalMarks}</span>
                         </div>
                    </div>
                ))}
             </div>
             {savedPapers.length === 0 && (
                 <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
                     <FolderOpen size={48} className="mb-4 opacity-20"/>
                     <p>No saved papers found.</p>
                 </div>
             )}
        </div>
    );

    const renderScopeSelection = () => {
        const classes = [...new Set(chaptersList.map(c => c.classLevel))].sort((a,b) => a-b);
        const filteredChaps = scope.classLevel ? chaptersList.filter(c => c.classLevel.toString() === scope.classLevel.toString()) : [];

        return (
            <div className="space-y-6 h-full flex flex-col">
                 <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg self-start">
                     <button onClick={() => setActiveTab('create')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'create' ? 'bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white' : 'text-zinc-500'}`}>Create New</button>
                     <button onClick={() => setActiveTab('saved')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'saved' ? 'bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white' : 'text-zinc-500'}`}>Saved Papers</button>
                 </div>

                 {activeTab === 'saved' ? renderSavedPapers() : (
                    <>
                        <div>
                            <InputLabel>Class Level</InputLabel>
                            <select
                                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm"
                                value={scope.classLevel}
                                onChange={(e) => setScope({...scope, classLevel: e.target.value, selectedChapterIds: []})}
                            >
                                <option value="">Select Class</option>
                                {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                            </select>
                        </div>

                        {scope.classLevel && (
                            <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
                                {/* LEFT */}
                                <div className="flex flex-col min-h-0">
                                    <InputLabel>1. Select Chapters & Units</InputLabel>
                                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 bg-zinc-50/50 dark:bg-zinc-900/50">
                                        {filteredChaps.map(chap => {
                                            const isSelected = scope.selectedChapterIds.includes(chap._id);
                                            return (
                                                <div key={chap._id} className={`mb-2 border rounded-lg p-3 transition-colors ${isSelected ? 'border-indigo-500 bg-white dark:bg-zinc-800 shadow-sm' : 'border-transparent hover:bg-white dark:hover:bg-zinc-800'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 accent-indigo-600"
                                                            checked={isSelected}
                                                            onChange={(e) => {
                                                                const newIds = e.target.checked
                                                                    ? [...scope.selectedChapterIds, chap._id]
                                                                    : scope.selectedChapterIds.filter(id => id !== chap._id);
                                                                setScope({ ...scope, selectedChapterIds: newIds });
                                                            }}
                                                        />
                                                        <span className="font-bold text-sm text-zinc-700 dark:text-zinc-200">{chap.title}</span>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="ml-7 mt-2 grid grid-cols-1 gap-1">
                                                            {chap.units.map((u, uIdx) => (
                                                                <label key={uIdx} className="flex items-center gap-2 text-xs text-zinc-500 hover:text-indigo-500 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="rounded text-indigo-500"
                                                                        checked={(scope.selectedUnitIndices[chap._id] || []).includes(uIdx)}
                                                                        onChange={(e) => {
                                                                            const current = scope.selectedUnitIndices[chap._id] || [];
                                                                            const updated = e.target.checked ? [...current, uIdx] : current.filter(i => i !== uIdx);
                                                                            setScope({ ...scope, selectedUnitIndices: { ...scope.selectedUnitIndices, [chap._id]: updated } });
                                                                        }}
                                                                    />
                                                                    {u.title}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* RIGHT */}
                                <div className="flex flex-col min-h-0">
                                    <InputLabel>2. Organize Chapter Sequence</InputLabel>
                                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 bg-white dark:bg-zinc-900">
                                        {scope.selectedChapterIds.length === 0 && (
                                            <div className="h-full flex items-center justify-center text-xs text-zinc-400 italic">Select chapters to arrange them</div>
                                        )}
                                        {scope.selectedChapterIds.map((id, idx) => {
                                            const chap = chaptersList.find(c => c._id === id);
                                            if(!chap) return null;
                                            return (
                                                <div key={id} className="flex items-center gap-2 mb-2 p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg group">
                                                    <span className="text-xs font-bold text-zinc-400 w-4">{idx + 1}.</span>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-bold">{chap.title}</div>
                                                        <div className="text-[10px] text-zinc-500">
                                                            {(scope.selectedUnitIndices[id] || []).length} units selected
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-1 opacity-50 group-hover:opacity-100">
                                                        <button onClick={() => moveChapterOrder(idx, -1)} disabled={idx === 0} className="p-1 hover:bg-indigo-100 text-zinc-500 hover:text-indigo-600 rounded disabled:opacity-20"><MoveUp size={12}/></button>
                                                        <button onClick={() => moveChapterOrder(idx, 1)} disabled={idx === scope.selectedChapterIds.length - 1} className="p-1 hover:bg-indigo-100 text-zinc-500 hover:text-indigo-600 rounded disabled:opacity-20"><MoveDown size={12}/></button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        <button onClick={handleScopeSelection} disabled={scope.selectedChapterIds.length === 0} className="w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? "Loading..." : <>Generate Builder <ChevronRight size={16}/></>}
                        </button>
                    </>
                 )}
            </div>
        );
    };

    const renderBuilder = () => (
        <div className="flex flex-col h-full">
            <div className="grid grid-cols-12 gap-4 mb-6 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="col-span-6"><InputLabel>Test Title</InputLabel><ThemedInput value={testPaper.title} onChange={(e) => setTestPaper({...testPaper, title: e.target.value})} /></div>

                {/* AUTO CALCULATED MARKS DISPLAY */}
                <div className="col-span-3">
                    <InputLabel>Total Marks (Auto)</InputLabel>
                    <div className="h-10 px-3 flex items-center bg-indigo-50/50 border border-indigo-200 rounded-lg text-indigo-700 font-bold">
                        {calculatedTotalMarks}
                    </div>
                </div>

                <div className="col-span-3"><InputLabel>Duration</InputLabel><ThemedInput value={testPaper.time} onChange={(e) => setTestPaper({...testPaper, time: e.target.value})} /></div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 pb-20">
                {testPaper.sections.map((section, sIdx) => {
                    if (typeof section !== 'object' || !section) return null;

                    const SectionIcon = SECTION_TYPES[section.type]?.icon || FileText;
                    const isWriting = section.type === 'WRITING';

                    const safeTitle = typeof section.title === 'string' ? section.title :
                                    section.title?.toString() || SECTION_TYPES[section.type]?.defaultTitle || '';

                    const passageObj = contentPool.find(c => c.id === section.contentId);
                    const resolvedPassage = section.type === 'SEEN'
                        ? (passageObj ? passageObj.text : "")
                        : (section.customText || "");

                    return (
                        <div key={section.id || sIdx} className="relative bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 group">
                            <div className="absolute top-4 right-4 flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => moveSection(sIdx, -1)} disabled={sIdx === 0} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded disabled:opacity-30"><MoveUp size={14}/></button>
                                <button onClick={() => moveSection(sIdx, 1)} disabled={sIdx === testPaper.sections.length - 1} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded disabled:opacity-30"><MoveDown size={14}/></button>
                                <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
                                <button onClick={() => removeSection(sIdx)} className="p-1 hover:bg-red-100 text-red-500 rounded"><Trash2 size={14}/></button>
                            </div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
                                    <SectionIcon size={20} />
                                </div>
                                <div className="flex-1 mr-20">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{SECTION_TYPES[section.type]?.label}</span>
                                    <input
                                        className="block w-full bg-transparent font-bold text-lg text-zinc-900 dark:text-zinc-100 outline-none border-b border-dashed border-transparent hover:border-zinc-300 focus:border-indigo-500 transition-colors"
                                        value={safeTitle}
                                        onChange={(e) => updateSection(sIdx, 'title', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="mb-8">
                                {section.type === 'SEEN' && (
                                    <div className="space-y-2">
                                        <InputLabel>Select Source Chapter</InputLabel>
                                        <select className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm" value={section.contentId} onChange={(e) => updateSection(sIdx, 'contentId', e.target.value)}>
                                            <option value="">-- Choose a Chapter --</option>
                                            {contentPool.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                        </select>
                                    </div>
                                )}
                                {section.type === 'UNSEEN' && (
                                    <div className="space-y-4">
                                        <UnseenPassageGenerator
                                            onGenerate={(text) => updateSection(sIdx, 'customText', text)}
                                        />
                                        <div>
                                            <InputLabel>Passage Text</InputLabel>
                                            <ThemedTextarea
                                                value={section.customText}
                                                onChange={(e) => updateSection(sIdx, 'customText', e.target.value)}
                                                placeholder="Paste text manually or generate using AI..."
                                                className="min-h-[150px]"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-6">
                                {section.groups.map((group, gIdx) => (
                                    <QuestionGroupBuilder
                                        key={group.id || gIdx}
                                        group={group}
                                        index={gIdx}
                                        isWriting={isWriting}
                                        sourceText={resolvedPassage}
                                        onChange={(updatedGroup) => updateGroup(sIdx, gIdx, updatedGroup)}
                                        onRemove={() => removeGroup(sIdx, gIdx)}
                                    />
                                ))}
                            </div>
                            {!isWriting && (
                                <div className="mt-6 pt-6 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                                    <div className="text-xs font-bold text-zinc-400 uppercase mb-3">Add Question Type</div>
                                    <div className="flex flex-wrap gap-2">
                                        {QUESTION_TYPES.map(t => (
                                            <button key={t.id} onClick={() => addGroup(sIdx, t.id)} className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-200 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 transition-colors">
                                                + {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
                    {Object.keys(SECTION_TYPES).map(type => (
                        <button key={type} onClick={() => addSection(type)} className="flex flex-col items-center gap-2 p-4 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-zinc-500 hover:text-indigo-600">
                            <Plus size={20}/>
                            <span className="text-xs font-bold uppercase">{SECTION_TYPES[type].label}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                <button onClick={() => setStep(1)} className="px-6 py-2 text-zinc-500 font-bold hover:text-black dark:hover:text-white">Back to Scope</button>
                <div className="flex gap-4">
                    <div className="text-right mr-4">
                        <div className="text-[10px] text-zinc-400 uppercase font-bold">Total Marks</div>
                        <div className="text-xl font-bold">{calculatedTotalMarks}</div>
                    </div>
                    <button onClick={() => setStep(3)} className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-xl flex items-center gap-2 hover:opacity-90">Preview Paper <ArrowLeft size={16} className="rotate-180"/></button>
                </div>
            </div>
        </div>
    );

    const renderPreview = () => {
        let globalGroupCounter = 1;
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto bg-white text-black p-12 font-serif shadow-inner">
                    <div className="text-center border-b-2 border-black pb-6 mb-8">
                        <h1 className="text-3xl font-bold uppercase tracking-widest mb-2">{testPaper.title}</h1>
                        <div className="flex justify-between text-sm font-bold mt-4 uppercase">
                            <span>Time: {testPaper.time}</span>
                            <span>Total Marks: {calculatedTotalMarks}</span>
                        </div>
                    </div>
                    {/* ... (Existing Preview Rendering Logic - same as before) ... */}
                    <div className="space-y-10">
                        {testPaper.sections.map((section) => {
                             const passageObj = contentPool.find(c => c.id === section.contentId);
                             const passageText = section.type === 'SEEN'
                                ? (passageObj ? passageObj.text : "")
                                : (section.customText || "");
                            const safeTitle = typeof section.title === 'string' ? section.title : section.title?.toString() || '';

                            return (
                                <div key={section.id}>
                                    <h3 className="text-center font-bold text-sm uppercase mb-4 bg-zinc-100 py-1 rounded">{safeTitle}</h3>
                                    {passageText ? (
                                        <div className="text-sm text-justify leading-relaxed mb-6 px-4 py-3 border-l-4 border-zinc-200 italic">
                                            {passageText.split('\n\n').map((p, i) => <p key={i} className="mb-2 indent-4">{p}</p>)}
                                        </div>
                                    ) : null}
                                    <div className="space-y-8">
                                        {section.groups.map((group) => {
                                            const currentGroupNum = globalGroupCounter++;
                                            return (
                                                <div key={group.id} className="space-y-3">
                                                    <div className="flex gap-2 text-sm font-bold italic text-zinc-800">
                                                        <span>{currentGroupNum}.</span>
                                                        <span>{group.instruction}</span>
                                                    </div>
                                                    <div className="space-y-3 pl-6">
                                                        {group.questions.map((q, qIdx) => (
                                                            <div key={qIdx} className="flex justify-between items-baseline gap-4 text-sm">
                                                                <div className="flex gap-2 w-full">
                                                                    <span className="font-bold w-6">({String.fromCharCode(97 + qIdx)})</span>
                                                                    <div className="w-full">
                                                                        <p>{q.text}</p>
                                                                        {group.type === 'MCQ' && (
                                                                            <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1 text-xs ml-4">
                                                                                {q.options?.map((opt, oIdx) => (
                                                                                    <span key={oIdx}>({String.fromCharCode(65 + oIdx)}) {opt || "______"}</span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <span className="font-bold whitespace-nowrap">[{q.marks}]</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="flex gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button onClick={() => setStep(2)} className="flex-1 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-zinc-500">Keep Editing</button>

                    {/* NEW: SAVE BUTTON */}
                    <button onClick={handleSavePaper} disabled={loading} className="flex-1 py-3 bg-zinc-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black disabled:opacity-50">
                        {loading ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>}
                        {currentPaperId ? "Update Paper" : "Save Paper"}
                    </button>

                    {isClient ? (
                        <PDFDownloadLink
                            document={<TestDocument testPaper={testPaper} contentPool={contentPool} totalMarks={calculatedTotalMarks} />}
                            fileName={`${testPaper.title.replace(/\s+/g, '_')}.pdf`}
                            className="flex-1"
                        >
                            {({ blob, url, loading, error }) => (
                                <button disabled={loading} className="w-full h-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50">
                                    <Printer size={18}/> {loading ? 'Generating PDF...' : 'Download PDF'}
                                </button>
                            )}
                        </PDFDownloadLink>
                    ) : <button disabled className="flex-1 py-3 bg-zinc-200 text-zinc-400 rounded-xl font-bold">Loading PDF Engine...</button>}
                </div>
            </div>
        );
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white dark:bg-zinc-950 w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
                    <h2 className="font-bold text-lg flex items-center gap-2"><FileText className="text-indigo-500"/> Test Paper Generator <span className="bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded text-xs text-zinc-500 font-normal">Step {step}/3</span></h2>
                    <button onClick={onClose}><X className="text-zinc-400 hover:text-black dark:hover:text-white"/></button>
                </div>
                <div className="p-6 flex-1 overflow-hidden">
                    {step === 1 && renderScopeSelection()}
                    {step === 2 && renderBuilder()}
                    {step === 3 && renderPreview()}
                </div>
            </motion.div>
        </motion.div>
    );
}

// ... UnseenPassageGenerator and QuestionGroupBuilder remain the same as previously provided ...
function UnseenPassageGenerator({ onGenerate }) {
    const [topic, setTopic] = useState("");
    const [length, setLength] = useState("200");
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate_passage', // TRIGGER NEW MODE
                    topic: topic || "General Interest",
                    length: length
                })
            });
            const data = await res.json();
            if (data.passage) {
                onGenerate(data.passage);
            }
        } catch (e) {
            console.error("AI Error", e);
            alert("Failed to generate passage");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-3 mb-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg">
             <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1">
                <Sparkles size={12}/> AI Passage Generator
             </div>
             <div className="flex flex-wrap gap-2">
                <input
                   value={topic}
                   onChange={(e) => setTopic(e.target.value)}
                   placeholder="Topic (e.g. Space, History, Nature)..."
                   className="flex-1 min-w-[150px] text-xs p-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:border-indigo-500 outline-none"
                />
                <select
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="text-xs p-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:border-indigo-500 outline-none"
                >
                    <option value="100">Short (~100 words)</option>
                    <option value="200">Medium (~200 words)</option>
                    <option value="350">Long (~350 words)</option>
                    <option value="500">Very Long (~500 words)</option>
                </select>
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? <Loader2 size={12} className="animate-spin"/> : <RefreshCw size={12}/>}
                    {loading ? "Writing..." : "Generate Text"}
                </button>
             </div>
        </div>
    );
}

function QuestionGroupBuilder({ group, index, isWriting, sourceText, onChange, onRemove }) {
    const [aiLoading, setAiLoading] = useState(false);
    const [questionCount, setQuestionCount] = useState(3);
    const typeLabel = isWriting ? "Writing Tasks" : QUESTION_TYPES.find(t => t.id === group.type)?.label || group.type;

    const updateQuestion = (qIdx, field, val) => {
        const newQs = [...group.questions];
        if (field === 'text') {
            newQs[qIdx][field] = String(val);
        } else {
            newQs[qIdx][field] = val;
        }
        onChange({ ...group, questions: newQs });
    };

    const updateOption = (qIdx, optIdx, val) => {
        const newQs = [...group.questions];
        if(!newQs[qIdx].options) newQs[qIdx].options = ["","","",""];
        newQs[qIdx].options[optIdx] = String(val);
        onChange({ ...group, questions: newQs });
    };

    const addQuestion = () => {
        const defaultMarks = isWriting ? 5 : QUESTION_TYPES.find(t => t.id === group.type)?.marks || 1;
        const newQ = { text: "", marks: defaultMarks };
        if(group.type === 'MCQ') newQ.options = ["","","",""];
        onChange({ ...group, questions: [...group.questions, newQ] });
    };

    const removeQuestion = (qIdx) => {
        onChange({ ...group, questions: group.questions.filter((_, i) => i !== qIdx) });
    };

    const handleAIGenerate = async () => {
        if (!sourceText) { alert("Please select or generate a passage first."); return; }
        setAiLoading(true);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    passage: sourceText,
                    type: group.type,
                    marks: QUESTION_TYPES.find(t => t.id === group.type)?.marks || 1,
                    count: parseInt(questionCount) || 3
                })
            });
            const data = await res.json();
            if (data.questions) {
                const newQuestions = data.questions.map(q => ({
                    ...q,
                    text: String(q.text || ""),
                    options: group.type === 'MCQ' ? (q.options || ["","","",""]) : undefined
                }));
                const currentQs = group.questions.length === 1 && !group.questions[0].text ? [] : group.questions;
                onChange({ ...group, questions: [...currentQs, ...newQuestions] });
            }
        } catch (e) {
            console.error(e);
            alert("Failed to generate questions. Check API key or limit.");
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <div className="bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden transition-all hover:border-indigo-300 dark:hover:border-indigo-800">
            <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex-1 flex items-center gap-3">
                    <span className="text-xs font-bold text-indigo-500 uppercase px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 rounded">{typeLabel}</span>
                    <input
                        className="flex-1 bg-transparent text-sm font-medium text-zinc-600 dark:text-zinc-300 outline-none placeholder:italic"
                        placeholder="Enter instructions for this section..."
                        value={typeof group.instruction === 'string' ? group.instruction : ''}
                        onChange={(e) => onChange({...group, instruction: e.target.value})}
                    />
                </div>
                <div className="flex items-center gap-2">
                    {!isWriting && sourceText && (
                        <div className="flex items-center gap-1 bg-white dark:bg-zinc-700 rounded-full border border-zinc-200 dark:border-zinc-600 p-0.5 pl-3">
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-300 font-bold uppercase mr-1">Count:</span>
                            <input
                                type="number"
                                min="1"
                                max="15"
                                value={questionCount}
                                onChange={(e) => setQuestionCount(e.target.value)}
                                className="w-8 text-xs font-bold text-center bg-transparent outline-none dark:text-white"
                            />
                            <button
                                onClick={handleAIGenerate}
                                disabled={aiLoading}
                                className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-full hover:opacity-90 disabled:opacity-50 transition-all shadow-sm ml-1"
                            >
                                {aiLoading ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>}
                                {aiLoading ? "..." : "Generate"}
                            </button>
                        </div>
                    )}
                    {!isWriting && <button onClick={onRemove} className="p-1.5 hover:bg-red-100 text-zinc-400 hover:text-red-500 rounded"><Trash2 size={14}/></button>}
                </div>
            </div>
            <div className="p-4 space-y-3">
                {group.questions.map((q, qIdx) => (
                    <div key={qIdx} className="flex flex-col gap-2">
                        <div className="flex gap-2 items-start">
                            <span className="text-xs font-bold text-zinc-300 pt-2 w-4">({String.fromCharCode(97 + qIdx)})</span>
                            <div className="flex-1">
                                {isWriting ? (
                                    <ThemedTextarea
                                        value={typeof q.text === 'string' ? q.text : ''}
                                        onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)}
                                        placeholder="Enter writing prompt or topic..."
                                        className="text-sm bg-white dark:bg-zinc-800 min-h-[60px]"
                                    />
                                ) : (
                                    <ThemedInput
                                        value={typeof q.text === 'string' ? q.text : ''}
                                        onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)}
                                        placeholder="Enter question text..."
                                        className="text-sm bg-white dark:bg-zinc-800"
                                    />
                                )}
                            </div>
                            <div className="w-16"><input type="number" className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded p-1.5 text-xs text-center font-mono" value={q.marks} onChange={(e) => updateQuestion(qIdx, 'marks', e.target.value)} /></div>
                            <button onClick={() => removeQuestion(qIdx)} className="p-2 text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                        </div>
                        {!isWriting && group.type === 'MCQ' && (
                            <div className="ml-8 grid grid-cols-2 gap-2">
                                {[0, 1, 2, 3].map((optIdx) => (
                                    <div key={optIdx} className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-zinc-400 w-3">{String.fromCharCode(65 + optIdx)}</span>
                                        <input
                                            className="w-full text-xs p-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded focus:border-indigo-500 outline-none"
                                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                            value={q.options?.[optIdx] || ""}
                                            onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                <button onClick={addQuestion} className="mt-2 text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 px-2 py-1 hover:bg-indigo-50 rounded transition-colors"><Plus size={14}/> Add {isWriting ? "Topic" : "Question"}</button>
            </div>
        </div>
    );
}
