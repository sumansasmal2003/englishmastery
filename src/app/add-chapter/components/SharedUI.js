import {
  ListChecks, CheckSquare, SplitSquareHorizontal, FileText, BoxSelect, ArrowDownUp, Type, Highlighter, Table2, ArrowRightLeft, HelpCircle,
  Grid3X3
} from "lucide-react";

export const InputLabel = ({ children, icon: Icon }) => (
  <label className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-2">
    {Icon && <Icon size={12} />}
    {children}
  </label>
);

export const ThemedInput = ({ ...props }) => (
  <input
    {...props}
    className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-sm dark:shadow-none"
  />
);

export const ThemedTextarea = ({ ...props }) => (
  <textarea
    {...props}
    className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 resize-none min-h-[100px] shadow-sm dark:shadow-none"
  />
);

export const ActivityBadge = ({ type }) => {
    const config = {
        MCQ: { color: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20", label: "Multiple Choice" },
        TRUE_FALSE: { color: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-500/20", label: "True / False" },
        MATCHING: { color: "bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400 border-pink-200 dark:border-pink-500/20", label: "Matching" },
        CHART_FILL: { color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20", label: "Chart Completion" },
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

export const SidebarSkeleton = () => (
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

export const ACTIVITY_TYPES = [
    { type: 'MCQ', label: 'Multiple Choice', icon: ListChecks },
    { type: 'TRUE_FALSE', label: 'True / False', icon: CheckSquare },
    { type: 'MATCHING', label: 'Matching', icon: SplitSquareHorizontal },
    { type: 'FILL_BLANKS', label: 'Fill Blanks', icon: FileText },
    { type: 'QA', label: 'Q & A', icon: HelpCircle },
    { type: 'WORD_BOX', label: 'Word Box Fill', icon: BoxSelect },
    { type: 'REARRANGE', label: 'Rearrange', icon: ArrowDownUp },
    { type: 'UNDERLINE', label: 'Underline', icon: Type },
    { type: 'UNDERLINE_CIRCLE', label: 'Underline & Circle', icon: Highlighter },
    { type: 'CATEGORIZE', label: 'Column Sort', icon: Table2 },
    { type: 'CAUSE_EFFECT', label: 'Cause & Effect', icon: ArrowRightLeft },
    { type: 'CHART_FILL', label: 'Chart Completion', icon: Grid3X3 },
];
