import { X, Trash2, Plus, ArrowLeft, CheckCircle2 } from "lucide-react";
import { ActivityBadge, InputLabel, ThemedInput, ThemedTextarea, ACTIVITY_TYPES } from "./SharedUI";

export default function ActivityBuilder({ unitIdx, actIdx, activity, onChange, onRemove }) {

    // --- Handlers ---
    const updateField = (field, val) => {
        const newAct = { ...activity, [field]: val };
        onChange(newAct);
    };

    const updateQuestion = (qIdx, field, val) => {
        const newQuestions = [...activity.questions];
        newQuestions[qIdx][field] = val;
        onChange({ ...activity, questions: newQuestions });
    };

    const addQuestion = () => {
        let q = { text: "" };
        // Initialize specific structures based on type
        if (activity.type === 'MCQ') q = { text: "", options: ["", "", "", ""], correctAnswer: "" };
        if (activity.type === 'TRUE_FALSE') q = { text: "", isTrue: false, supportingStatement: "" };
        if (activity.type === 'MATCHING') q = { leftItem: "", rightItem: "" };
        if (activity.type === 'FILL_BLANKS' || activity.type === 'QA') q = { text: "", correctAnswer: "" };
        if (activity.type === 'REARRANGE') q = { text: "", options: ["", "", ""] };
        if (activity.type === 'WORD_BOX') q = { text: "", correctAnswer: "" };
        if (activity.type === 'CATEGORIZE') q = { text: "" };
        if (activity.type === 'CAUSE_EFFECT') q = { leftItem: "", rightItem: "", options: ["EFFECT"] };
        if (activity.type === 'UNDERLINE' || activity.type === 'UNDERLINE_CIRCLE') q = { text: "" };
        if (activity.type === 'CHART_FILL') {
             // Initialize with empty strings for each column
             const colCount = (activity.columnHeaders || []).length || 2;
             q = { options: new Array(colCount).fill("") };
        }

        const newQuestions = [...(activity.questions || []), q];
        onChange({ ...activity, questions: newQuestions });
    };

    const removeQuestion = (qIdx) => {
        const newQuestions = [...activity.questions];
        newQuestions.splice(qIdx, 1);
        onChange({ ...activity, questions: newQuestions });
    };

    // --- Special Handlers ---

    // For Word Box & Categorize headers (using Pipe | to separate)
    const updateGlobalOptions = (val) => {
        const items = val.split('|'); // Split by pipe to allow commas in text
        // Update all questions to keep sync
        const newQuestions = activity.questions.map(q => ({ ...q, options: items }));
        onChange({ ...activity, questions: newQuestions });
    };

    // For Cause/Effect headers
    const updateColumnHeaders = (val) => {
        const headers = val.split('|'); // Split by pipe
        onChange({ ...activity, columnHeaders: headers });
    };

    const updateCauseEffectToggle = (qIdx, hiddenSide) => {
        const newQuestions = [...activity.questions];
        if(!newQuestions[qIdx].options) newQuestions[qIdx].options = [];
        newQuestions[qIdx].options[0] = hiddenSide;
        onChange({ ...activity, questions: newQuestions });
    };

    // For MCQ Options
    const updateMCQOption = (qIdx, optIdx, val) => {
        const newQuestions = [...activity.questions];
        newQuestions[qIdx].options[optIdx] = val;
        onChange({ ...activity, questions: newQuestions });
    };

    // For Rearrange Lines
    const updateOptionArray = (qIdx, optIdx, val) => {
        const newQuestions = [...activity.questions];
        newQuestions[qIdx].options[optIdx] = val;
        onChange({ ...activity, questions: newQuestions });
    };

    const addOptionToQuestion = (qIdx) => {
        const newQuestions = [...activity.questions];
        newQuestions[qIdx].options.push("");
        onChange({ ...activity, questions: newQuestions });
    };

    const removeOptionFromQuestion = (qIdx, optIdx) => {
        const newQuestions = [...activity.questions];
        newQuestions[qIdx].options.splice(optIdx, 1);
        onChange({ ...activity, questions: newQuestions });
    };

    const updateChartHeaders = (val) => {
        const headers = val.split('|');
        // When headers change, we might need to resize existing question rows to match column count
        const newQuestions = activity.questions.map(q => {
            const currentOpts = q.options || [];
            // If new headers are longer, pad with empty strings. If shorter, slice.
            if (headers.length > currentOpts.length) {
                return { ...q, options: [...currentOpts, ...new Array(headers.length - currentOpts.length).fill("")] };
            } else if (headers.length < currentOpts.length) {
                return { ...q, options: currentOpts.slice(0, headers.length) };
            }
            return q;
        });

        onChange({ ...activity, columnHeaders: headers, questions: newQuestions });
    };

    // For Chart Fill Cells
    const updateChartCell = (qIdx, colIdx, val) => {
        const newQuestions = [...activity.questions];
        if (!newQuestions[qIdx].options) newQuestions[qIdx].options = [];
        newQuestions[qIdx].options[colIdx] = val;
        onChange({ ...activity, questions: newQuestions });
    };


    // --- RENDER ---
    return (
        <div className="bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-700/50 rounded-xl p-5 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors relative z-10">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1 mr-4">
                    <div className="flex items-center gap-3 mb-2">
                        <ActivityBadge type={activity.type} />
                        <span className="text-[10px] text-zinc-400 font-mono">{(activity.questions || []).length} Items</span>
                    </div>
                    <input className="w-full bg-transparent border-b border-dashed border-zinc-300 dark:border-zinc-600 text-xs text-zinc-600 dark:text-zinc-400 focus:outline-none focus:border-indigo-500 py-1" value={activity.instruction} onChange={(e) => updateField('instruction', e.target.value)} />
                </div>
                <button type="button" onClick={onRemove} className="text-zinc-400 hover:text-red-500 p-1 rounded"><Trash2 size={14} /></button>
            </div>

            {/* --- Global Settings Inputs --- */}
            {activity.type === 'WORD_BOX' && (
                <div className="mb-4">
                    <InputLabel>Word List (Pipe separated)</InputLabel>
                    <ThemedInput placeholder="apple | banana | orange" value={(activity.questions?.[0]?.options || []).join('|')} onChange={(e) => updateGlobalOptions(e.target.value)} />
                    <p className="text-[10px] text-zinc-400 mt-1">Use pipe <code>|</code> to separate words.</p>
                </div>
            )}

            {activity.type === 'CATEGORIZE' && (
                <div className="mb-4 space-y-2">
                    <InputLabel>Column Headers (Pipe separated)</InputLabel>
                    <ThemedInput placeholder="Countable Nouns | Uncountable Nouns" value={(activity.questions?.[0]?.options || []).join('|')} onChange={(e) => updateGlobalOptions(e.target.value)} />
                    <p className="text-[10px] text-zinc-400">Use <code>|</code> to separate columns. Use syntax <code>{`{word|0}`}</code> for 1st column.</p>
                </div>
            )}

            {activity.type === 'CAUSE_EFFECT' && (
                <div className="mb-4">
                    <InputLabel>Column Headers (Pipe separated)</InputLabel>
                    <ThemedInput placeholder="Cause | Effect" value={(activity.columnHeaders || []).join('|')} onChange={(e) => updateColumnHeaders(e.target.value)} />
                </div>
            )}

            {activity.type === 'CHART_FILL' && (
                <div className="mb-4 space-y-2">
                    <InputLabel>Column Headers (Pipe separated)</InputLabel>
                    <ThemedInput
                        placeholder="Pronouns | Possessive Adjectives | Possessive Pronouns"
                        value={(activity.columnHeaders || []).join('|')}
                        onChange={(e) => updateChartHeaders(e.target.value)}
                    />
                    <div className="flex items-center gap-2 p-2 bg-indigo-50 dark:bg-indigo-900/20 text-[10px] text-indigo-700 dark:text-indigo-300 rounded border border-indigo-100 dark:border-indigo-800">
                        <CheckCircle2 size={12} />
                        <span>Tip: Wrap answers in curly braces <code>{`{}`}</code> to make them fillable. Example: <code>{`My | {Mine}`}</code></span>
                    </div>
                </div>
            )}

            {/* --- Question List --- */}
            <div className="space-y-3 pl-3 border-l-2 border-zinc-200 dark:border-zinc-700">
                {(activity.questions || []).map((q, qIdx) => {
                     const leftLabel = activity.columnHeaders?.[0] || "Cause";
                     const rightLabel = activity.columnHeaders?.[1] || "Effect";

                    return (
                        <div key={qIdx} className="relative group/q bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 shadow-sm">
                            <button type="button" onClick={() => removeQuestion(qIdx)} className="absolute top-2 right-2 text-zinc-300 hover:text-red-400 opacity-0 group-hover/q:opacity-100 transition-opacity"><X size={12} /></button>

                            {/* 1. MCQ RENDERER */}
                            {activity.type === 'MCQ' && (
                                <div className="space-y-2.5">
                                    <input className="w-full text-sm font-medium bg-transparent outline-none placeholder:text-zinc-300" placeholder="Question Text..." value={q.text} onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)} />
                                    <div className="grid grid-cols-2 gap-2">
                                        {(q.options || []).map((opt, optIdx) => (
                                            <div key={optIdx} className="flex items-center gap-2">
                                                <div onClick={() => updateQuestion(qIdx, 'correctAnswer', opt)} className={`w-3.5 h-3.5 rounded-full border cursor-pointer transition-colors ${q.correctAnswer === opt && opt !== "" ? 'bg-green-500 border-green-500 ring-2 ring-green-100 dark:ring-green-900' : 'border-zinc-300 dark:border-zinc-600 hover:border-indigo-400'}`}></div>
                                                <input className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1.5 rounded border border-transparent focus:border-zinc-200 dark:focus:border-zinc-700 outline-none" placeholder={`Option ${optIdx + 1}`} value={opt} onChange={(e) => { updateMCQOption(qIdx, optIdx, e.target.value); if(q.correctAnswer === opt) updateQuestion(qIdx, 'correctAnswer', e.target.value); }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 2. REARRANGE RENDERER */}
                            {activity.type === 'REARRANGE' && (
                                <div className="space-y-2">
                                    <input className="w-full text-sm font-medium bg-transparent outline-none placeholder:text-zinc-300" placeholder="Context / Title (Optional)" value={q.text} onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)} />
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase">Correct Sequence:</p>
                                        {(q.options || []).map((line, lIdx) => (
                                            <div key={lIdx} className="flex items-center gap-2">
                                                <span className="text-[10px] text-zinc-400 font-mono w-4">{lIdx+1}.</span>
                                                <input className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 px-2 py-1.5 rounded border border-transparent focus:border-zinc-300 outline-none" value={line} onChange={(e) => updateOptionArray(qIdx, lIdx, e.target.value)} placeholder={`Sentence ${lIdx+1}`} />
                                                <button type="button" onClick={() => removeOptionFromQuestion(qIdx, lIdx)} className="text-zinc-300 hover:text-red-500"><X size={12}/></button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => addOptionToQuestion(qIdx)} className="text-[10px] text-indigo-500 font-bold hover:underline">+ Add Line</button>
                                    </div>
                                </div>
                            )}

                            {/* 3. TRUE/FALSE RENDERER */}
                            {activity.type === 'TRUE_FALSE' && (
                                <div className="flex gap-4 items-start">
                                    <div className="flex-1 space-y-2">
                                            <input className="w-full text-sm bg-transparent outline-none" placeholder="Statement..." value={q.text} onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)} />
                                            <input className="w-full text-xs text-zinc-500 bg-transparent outline-none" placeholder="Supporting statement..." value={q.supportingStatement} onChange={(e) => updateQuestion(qIdx, 'supportingStatement', e.target.value)} />
                                    </div>
                                    <button type="button" onClick={() => updateQuestion(qIdx, 'isTrue', !q.isTrue)} className={`px-4 py-1.5 rounded text-xs font-bold transition-colors ${q.isTrue ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{q.isTrue ? "TRUE" : "FALSE"}</button>
                                </div>
                            )}

                            {/* 4. MATCHING RENDERER */}
                            {activity.type === 'MATCHING' && (
                                <div className="flex gap-4 items-center">
                                    <input className="flex-1 text-xs bg-zinc-50 dark:bg-zinc-800 p-2 rounded outline-none" placeholder="Left Item (A)" value={q.leftItem} onChange={(e) => updateQuestion(qIdx, 'leftItem', e.target.value)} />
                                    <ArrowLeft size={12} className="text-zinc-300" />
                                    <input className="flex-1 text-xs bg-zinc-50 dark:bg-zinc-800 p-2 rounded outline-none" placeholder="Right Match (B)" value={q.rightItem} onChange={(e) => updateQuestion(qIdx, 'rightItem', e.target.value)} />
                                </div>
                            )}

                            {activity.type === 'CHART_FILL' && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold text-zinc-400">ROW {qIdx + 1}</span>
                                    </div>
                                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${(activity.columnHeaders || []).length || 1}, 1fr)` }}>
                                        {(activity.columnHeaders || ['Col 1', 'Col 2']).map((header, colIdx) => (
                                            <div key={colIdx} className="space-y-1">
                                                <label className="text-[9px] text-zinc-400 uppercase tracking-wider truncate block">{header}</label>
                                                <input
                                                    className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 px-2 py-2 rounded border border-zinc-200 dark:border-zinc-700 outline-none focus:border-indigo-500"
                                                    placeholder="Value..."
                                                    value={q.options?.[colIdx] || ""}
                                                    onChange={(e) => updateChartCell(qIdx, colIdx, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 5. CAUSE EFFECT RENDERER */}
                            {activity.type === 'CAUSE_EFFECT' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-zinc-400 truncate max-w-[100px]">{leftLabel.toUpperCase()}</span>
                                            <button type="button" onClick={() => updateCauseEffectToggle(qIdx, 'CAUSE')} className={`text-[9px] px-2 py-0.5 rounded border ${q.options?.[0] === 'CAUSE' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-zinc-50 border-zinc-200 text-zinc-400'}`}>
                                                {q.options?.[0] === 'CAUSE' ? 'Question (Blank)' : 'Visible'}
                                            </button>
                                        </div>
                                        <ThemedTextarea className="min-h-[50px] text-xs" placeholder={`Enter ${leftLabel}...`} value={q.leftItem} onChange={(e) => updateQuestion(qIdx, 'leftItem', e.target.value)} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-zinc-400 truncate max-w-[100px]">{rightLabel.toUpperCase()}</span>
                                            <button type="button" onClick={() => updateCauseEffectToggle(qIdx, 'EFFECT')} className={`text-[9px] px-2 py-0.5 rounded border ${q.options?.[0] === 'EFFECT' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-zinc-50 border-zinc-200 text-zinc-400'}`}>
                                                {q.options?.[0] === 'EFFECT' ? 'Question (Blank)' : 'Visible'}
                                            </button>
                                        </div>
                                        <ThemedTextarea className="min-h-[50px] text-xs" placeholder={`Enter ${rightLabel}...`} value={q.rightItem} onChange={(e) => updateQuestion(qIdx, 'rightItem', e.target.value)} />
                                    </div>
                                </div>
                            )}

                            {/* 6. CATEGORIZE RENDERER */}
                            {activity.type === 'CATEGORIZE' && (
                                <div className="space-y-2">
                                    <input className="w-full text-sm font-medium bg-transparent outline-none placeholder:text-zinc-300" placeholder="Sentence (e.g. The {cat|0} drank {milk|1})" value={q.text} onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)} />
                                </div>
                            )}

                            {/* 7. UNDERLINE / CIRCLE RENDERER */}
                            {(activity.type === 'UNDERLINE' || activity.type === 'UNDERLINE_CIRCLE') && (
                                <div className="space-y-2">
                                    <input className="w-full text-sm font-medium bg-transparent outline-none placeholder:text-zinc-300" placeholder="Sentence (e.g. The {cat} is sleeping)" value={q.text} onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)} />
                                    <p className="text-[10px] text-zinc-400 flex gap-3">
                                        <span>Underline: <code>{`{word}`}</code></span>
                                        {activity.type === 'UNDERLINE_CIRCLE' && <span>Circle: <code>{`[word]`}</code></span>}
                                    </p>
                                </div>
                            )}

                            {/* 8. STANDARD RENDERER (QA, FILL_BLANKS, WORD_BOX) */}
                            {['QA', 'FILL_BLANKS', 'WORD_BOX'].includes(activity.type) && (
                                <div className="space-y-2">
                                    <input className="w-full text-sm bg-transparent outline-none" placeholder={activity.type === 'QA' ? "Question..." : "Sentence with blank..."} value={q.text} onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)} />
                                    <input className="w-full text-xs bg-emerald-50 dark:bg-emerald-900/10 px-2 py-1 rounded outline-none text-emerald-700 placeholder:text-emerald-700/50" placeholder="Correct Answer..." value={q.correctAnswer} onChange={(e) => updateQuestion(qIdx, 'correctAnswer', e.target.value)} />
                                </div>
                            )}

                        </div>
                    );
                })}
                <button type="button" onClick={(e) => { e.preventDefault(); addQuestion(); }} className="text-xs text-zinc-400 hover:text-zinc-600 flex items-center gap-1">+ Add Question Row</button>
            </div>
        </div>
    );
}
