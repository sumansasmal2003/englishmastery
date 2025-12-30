import { X, Trash2, Network, Plus, ArrowDownLeft, ArrowDownRight, ArrowUpRight, MapPin, Calendar, User, PenLine, Users, MessageSquare, FileText, Briefcase } from "lucide-react";
import { InputLabel, ThemedInput, ThemedTextarea } from "./SharedUI";

export default function WritingBuilder({ unitIdx, wIdx, writing, onChange, onRemove }) {

    // --- Helper: Safely join array to string to prevent crashes ---
    const safeJoin = (val) => {
        if (Array.isArray(val)) return val.join(', ');
        if (typeof val === 'string') return val; // Already a string
        return ""; // Fallback
    };

    // --- Handlers ---
    const updateField = (field, val) => {
        onChange({ ...writing, [field]: val });
    };

    const updateData = (key, val) => {
        // Updated to handle 'characters' as an array too
        const isArrayField = ['hints', 'characters'].includes(key);

        const newData = {
            ...writing.data,
            [key]: isArrayField ? val.split(',').map(s => s.trim()) : val
        };
        onChange({ ...writing, data: newData });
    };

    // --- Family Tree Handlers ---
    const addFamilyMember = (parentId) => {
        const newMembers = [...(writing.data.familyMembers || [])];
        newMembers.push({ id: `mem-${Date.now()}`, parentId, partnerId: null, name: "", relation: "", details: "" });
        onChange({ ...writing, data: { ...writing.data, familyMembers: newMembers } });
    };

    const addSpouse = (partnerId) => {
        const newMembers = [...(writing.data.familyMembers || [])];
        const newId = `mem-${Date.now()}`;
        const original = newMembers.find(m => m.id === partnerId);
        if(original) original.partnerId = newId;

        newMembers.push({ id: newId, parentId: 'spouse', partnerId, name: "", relation: "Spouse", details: "" });
        onChange({ ...writing, data: { ...writing.data, familyMembers: newMembers } });
    };

    const updateMember = (id, field, val) => {
        const newMembers = writing.data.familyMembers.map(m => m.id === id ? { ...m, [field]: val } : m);
        onChange({ ...writing, data: { ...writing.data, familyMembers: newMembers } });
    };

    const removeMember = (id) => {
        let members = [...writing.data.familyMembers];
        const idsToDelete = [id];
        let found = true;
        while(found) {
            found = false;
            members.forEach(m => {
                if(idsToDelete.includes(m.parentId) && !idsToDelete.includes(m.id)) {
                    idsToDelete.push(m.id);
                    found = true;
                }
            });
        }
        members = members.filter(m => !idsToDelete.includes(m.id));
        onChange({ ...writing, data: { ...writing.data, familyMembers: members } });
    };

    const renderTree = (parentId) => {
        const children = (writing.data.familyMembers || []).filter(m => m.parentId === parentId && m.parentId !== 'spouse');
        if (children.length === 0 && parentId === null) return <div className="text-zinc-400 text-xs">Add a root member.</div>;

        return (
            <div className="flex gap-8 justify-center pt-4">
                {children.map(member => {
                    const spouse = writing.data.familyMembers.find(m => m.id === member.partnerId);
                    return (
                        <div key={member.id} className="flex flex-col items-center">
                            <div className="flex gap-2 items-center mb-6 relative">
                                <div className="bg-white dark:bg-zinc-800 border border-zinc-200 p-3 rounded-xl shadow-sm w-40 relative group/node">
                                    <button type="button" onClick={() => removeMember(member.id)} className="absolute -top-2 -right-2 bg-red-100 text-red-500 p-1 rounded-full opacity-0 group-hover/node:opacity-100"><X size={10}/></button>
                                    <div className="space-y-2">
                                        <input className="w-full text-xs font-bold bg-transparent outline-none border-b" placeholder="Name" value={member.name} onChange={(e) => updateMember(member.id, 'name', e.target.value)} />
                                        <input className="w-full text-[10px]" placeholder="Relation" value={member.relation} onChange={(e) => updateMember(member.id, 'relation', e.target.value)} />
                                    </div>
                                    <div className="flex gap-1 mt-2">
                                        <button type="button" onClick={() => addFamilyMember(member.id)} className="flex-1 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-bold rounded">+ Child</button>
                                        {!spouse && <button type="button" onClick={() => addSpouse(member.id)} className="flex-1 py-1 bg-pink-50 text-pink-600 text-[9px] font-bold rounded">+ Partner</button>}
                                    </div>
                                </div>
                                {spouse && (
                                    <div className="bg-pink-50/50 border border-pink-200 p-3 rounded-xl shadow-sm w-40 relative">
                                        <button type="button" onClick={() => removeMember(spouse.id)} className="absolute -top-2 -right-2 bg-red-100 text-red-500 p-1 rounded-full"><X size={10}/></button>
                                        <input className="w-full text-xs font-bold bg-transparent outline-none border-b" placeholder="Name" value={spouse.name} onChange={(e) => updateMember(spouse.id, 'name', e.target.value)} />
                                    </div>
                                )}
                            </div>
                            {(writing.data.familyMembers || []).some(m => m.parentId === member.id) && (
                                <div className="relative w-full border-t border-zinc-300">
                                    {renderTree(member.id)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-rose-50/30 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-xl p-5 relative">
             <div className="flex justify-between items-start mb-4">
                <div className="flex-1 mr-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-rose-100 text-rose-700 mb-2 inline-block">{writing.type.replace(/_/g, ' ')}</span>
                    <input className="w-full bg-transparent border-b border-dashed border-rose-200 text-sm font-medium py-1" value={writing.question} onChange={(e) => updateField('question', e.target.value)} placeholder="Prompt..." />
                </div>
                <button type="button" onClick={onRemove} className="text-rose-400 hover:text-rose-600 p-1 rounded"><Trash2 size={14} /></button>
            </div>

            {writing.type === 'NOTICE' && (
                <div className="mb-6 space-y-4 border-l-2 border-amber-200 pl-4">
                    <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-lg border border-amber-100 dark:border-amber-900/20">
                        <h4 className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-1">
                            <PenLine size={12}/> Notice Header Details
                        </h4>

                        {/* Top: Organization & Date */}
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <InputLabel>Issuing Organization / School</InputLabel>
                                <ThemedInput
                                    value={writing.data?.senderAddress || ""} // Reusing senderAddress field for Org Name
                                    onChange={(e) => updateData('senderAddress', e.target.value)}
                                    placeholder="e.g. ABC High School, Kolkata"
                                    className="font-bold text-center"
                                />
                            </div>
                            <div>
                                <InputLabel icon={Calendar}>Date of Issue</InputLabel>
                                <ThemedInput
                                    value={writing.data?.date || ""}
                                    onChange={(e) => updateData('date', e.target.value)}
                                    placeholder="e.g. 20th May, 2024"
                                />
                            </div>
                        </div>

                        {/* Middle: Subject/Heading */}
                        <div className="mb-4">
                            <InputLabel>Notice Headline / Subject</InputLabel>
                            <ThemedInput
                                value={writing.data?.subject || ""}
                                onChange={(e) => updateData('subject', e.target.value)}
                                placeholder="e.g. INTER-SCHOOL DEBATE COMPETITION"
                                className="uppercase font-bold text-center tracking-wide"
                            />
                        </div>

                        {/* Bottom: Signatory Details */}
                        <div className="grid md:grid-cols-2 gap-4 border-t border-dashed border-amber-200 dark:border-amber-800 pt-4 mt-4">
                            <div>
                                <InputLabel>Signatory Name</InputLabel>
                                <ThemedInput
                                    value={writing.data?.senderName || ""}
                                    onChange={(e) => updateData('senderName', e.target.value)}
                                    placeholder="e.g. Rahul Roy"
                                />
                            </div>
                            <div>
                                <InputLabel>Designation</InputLabel>
                                <ThemedInput
                                    value={writing.data?.salutation || ""} // Reusing salutation for Designation
                                    onChange={(e) => updateData('salutation', e.target.value)}
                                    placeholder="e.g. Cultural Secretary"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-100 dark:border-amber-800 text-center text-xs text-amber-600 dark:text-amber-400 font-medium">
                        The content of the Notice goes in the "Model Answer (Body)" box below.
                    </div>
                </div>
            )}

            {writing.type === 'SUMMARY' && (
                <div className="mb-6 space-y-4 border-l-2 border-rose-200 pl-4">
                     <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-lg border border-rose-100 dark:border-rose-900/20">
                        <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                            <FileText size={12}/> Source Passage
                        </h4>
                        <div>
                            <InputLabel>Passage to Summarize</InputLabel>
                            <ThemedTextarea
                                value={writing.data?.passage || ""}
                                onChange={(e) => updateData('passage', e.target.value)}
                                placeholder="Paste the original text here..."
                                className="min-h-[150px] font-serif"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* --- DIALOGUE FORM --- */}
            {writing.type === 'DIALOGUE' && (
                <div className="mb-6 space-y-4 border-l-2 border-rose-200 pl-4">
                     <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-lg border border-rose-100 dark:border-rose-900/20">
                        <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                            <MessageSquare size={12}/> Dialogue Details
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel icon={Users}>Characters (Comma separated)</InputLabel>
                                <ThemedInput
                                    value={safeJoin(writing.data?.characters)}
                                    onChange={(e) => updateData('characters', e.target.value)}
                                    placeholder="e.g. Shopkeeper, Customer"
                                />
                            </div>
                            <div>
                                <InputLabel icon={MapPin}>Setting / Context</InputLabel>
                                <ThemedInput
                                    value={writing.data?.setting || ""}
                                    onChange={(e) => updateData('setting', e.target.value)}
                                    placeholder="e.g. At a grocery store"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- INFORMAL LETTER FORM --- */}
            {writing.type === 'INFORMAL_LETTER' && (
                <div className="mb-6 space-y-4 border-l-2 border-rose-200 pl-4">
                    <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-lg border border-rose-100 dark:border-rose-900/20">
                        <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                            <ArrowUpRight size={12}/> Top Right Corner (Writer)
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel icon={MapPin}>Writer's Address</InputLabel>
                                <ThemedTextarea value={writing.data?.senderAddress || ""} onChange={(e) => updateData('senderAddress', e.target.value)} placeholder="Address..." className="min-h-[60px]" />
                            </div>
                            <div>
                                <InputLabel icon={Calendar}>Date</InputLabel>
                                <ThemedInput value={writing.data?.date || ""} onChange={(e) => updateData('date', e.target.value)} placeholder="Date..." />
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel icon={User}>Salutation</InputLabel>
                            <ThemedInput value={writing.data?.salutation || ""} onChange={(e) => updateData('salutation', e.target.value)} placeholder="Dear X," />
                        </div>
                        <div>
                            <InputLabel icon={PenLine}>Subject Line</InputLabel>
                            <ThemedInput value={writing.data?.subject || ""} onChange={(e) => updateData('subject', e.target.value)} placeholder="Subject..." />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-lg border border-rose-100 dark:border-rose-900/20">
                            <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-1"><ArrowDownLeft size={12}/> Bottom Left</h4>
                            <InputLabel icon={MapPin}>Recipient's Address</InputLabel>
                            <ThemedTextarea value={writing.data?.receiverAddress || ""} onChange={(e) => updateData('receiverAddress', e.target.value)} placeholder="To..." className="min-h-[80px]" />
                        </div>
                        <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-lg border border-rose-100 dark:border-rose-900/20">
                            <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-1"><ArrowDownRight size={12}/> Bottom Right</h4>
                            <div className="space-y-3">
                                <div><InputLabel>Leave Taking</InputLabel><ThemedInput value={writing.data?.closing || ""} onChange={(e) => updateData('closing', e.target.value)} placeholder="Yours..." /></div>
                                <div><InputLabel>Sender's Name</InputLabel><ThemedInput value={writing.data?.senderName || ""} onChange={(e) => updateData('senderName', e.target.value)} placeholder="Name..." /></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- NEW: FORMAL LETTER FORM (Strict Layout) --- */}
            {writing.type === 'FORMAL_LETTER' && (
                <div className="mb-6 space-y-4 border-l-2 border-indigo-200 pl-4">
                    {/* Top: Recipient Address & Designation (1) */}
                    <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/20">
                        <h4 className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-1">
                            <Briefcase size={12}/> ① Recipient Details
                        </h4>
                        <div>
                            <InputLabel>Name, Designation & Address</InputLabel>
                            <ThemedTextarea
                                value={writing.data?.receiverAddress || ""}
                                onChange={(e) => updateData('receiverAddress', e.target.value)}
                                placeholder="The Headmaster, XYZ School..."
                                className="min-h-[80px]"
                            />
                        </div>
                    </div>

                    {/* Middle: Subject (2) & Salutation (3) */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel icon={PenLine}>② Subject Line</InputLabel>
                            <ThemedInput
                                value={writing.data?.subject || ""}
                                onChange={(e) => updateData('subject', e.target.value)}
                                placeholder="Sub: Leave of absence..."
                            />
                        </div>
                        <div>
                            <InputLabel icon={User}>③ Salutation</InputLabel>
                            <ThemedInput
                                value={writing.data?.salutation || ""}
                                onChange={(e) => updateData('salutation', e.target.value)}
                                placeholder="Sir/Madam,"
                            />
                        </div>
                    </div>

                    {/* Body (4) is handled by main modelAnswer field below */}
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded border border-indigo-100 dark:border-indigo-800 text-center text-xs text-indigo-600 dark:text-indigo-300 font-medium">
                        ④ Enter the "Body of the Letter" in the Model Answer box below.
                    </div>

                    {/* Bottom Section */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Bottom Left: Writer Address (7) & Date (8) */}
                        <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/20 flex flex-col justify-end">
                            <h4 className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-1">
                                <ArrowDownLeft size={12}/> Bottom Left
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <InputLabel icon={MapPin}>⑦ Writer's Address</InputLabel>
                                    <ThemedTextarea
                                        value={writing.data?.senderAddress || ""}
                                        onChange={(e) => updateData('senderAddress', e.target.value)}
                                        placeholder="School Hostel..."
                                        className="min-h-[60px]"
                                    />
                                </div>
                                <div>
                                    <InputLabel icon={Calendar}>⑧ Date</InputLabel>
                                    <ThemedInput
                                        value={writing.data?.date || ""}
                                        onChange={(e) => updateData('date', e.target.value)}
                                        placeholder="24th July, 2024"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Right: Subscription (5) & Signature (6) */}
                        <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/20 flex flex-col justify-end text-right">
                            <h4 className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-3 flex items-center justify-end gap-1">
                                Bottom Right <ArrowDownRight size={12}/>
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <InputLabel>⑤ Subscription</InputLabel>
                                    <ThemedInput
                                        value={writing.data?.closing || ""}
                                        onChange={(e) => updateData('closing', e.target.value)}
                                        placeholder="Yours sincerely,"
                                        className="text-right"
                                    />
                                </div>
                                <div>
                                    <InputLabel>⑥ Signature / Name</InputLabel>
                                    <ThemedInput
                                        value={writing.data?.senderName || ""}
                                        onChange={(e) => updateData('senderName', e.target.value)}
                                        placeholder="Name..."
                                        className="text-right font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- FAMILY CHART --- */}
            {writing.type === 'FAMILY_CHART' ? (
                <div className="mb-6 bg-zinc-50 p-6 rounded-xl border border-zinc-200 overflow-x-auto">
                    <div className="flex justify-between items-center mb-4"><span className="text-xs font-bold uppercase flex items-center gap-2"><Network size={12}/> Tree</span></div>
                    <div className="min-w-max pb-4">{renderTree(null)}</div>
                    {(!writing.data.familyMembers || writing.data.familyMembers.length === 0) && <button type="button" onClick={() => addFamilyMember(null)} className="text-xs text-indigo-500">+ Add Root</button>}
                </div>
            ) : null}

            {/* --- GENERIC HINTS --- */}
            {!['FAMILY_CHART', 'INFORMAL_LETTER', 'FORMAL_LETTER', 'SUMMARY', 'DIALOGUE'].includes(writing.type) && (
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                     <div className="col-span-2">
                        <InputLabel>Hints / Points</InputLabel>
                        <ThemedTextarea
                            value={safeJoin(writing.data?.hints)}
                            onChange={(e) => updateData('hints', e.target.value)}
                            placeholder="Hints..."
                        />
                     </div>
                </div>
            )}

            {writing.type === 'SUMMARY' && (
                 <div className="mb-4">
                    <InputLabel>Word Limit</InputLabel>
                    <ThemedInput
                        value={writing.data?.wordLimit || ""}
                        onChange={(e) => updateData('wordLimit', e.target.value)}
                        placeholder="e.g. 1/3 of original length"
                    />
                 </div>
            )}

            <div><InputLabel>Model Answer (Body)</InputLabel><ThemedTextarea value={writing.modelAnswer} onChange={(e) => updateField('modelAnswer', e.target.value)} placeholder="Main body content..." className="min-h-[100px]"/></div>
        </div>
    );
}
