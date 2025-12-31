import dbConnect from "@/lib/db";
import Writing from "@/models/Writing";
import Link from "next/link";
import {
  ArrowLeft, Search, Filter, ArrowRight, ArrowLeft as PrevIcon,
  ArrowRight as NextIcon, FileText, Library, X
} from "lucide-react";

// Force dynamic rendering so search params work instantly
export const dynamic = 'force-dynamic';

// --- VISUAL COMPONENT: Side Graph Borders ---
const GraphBorder = ({ side = "left" }) => {
  const isLeft = side === "left";
  const containerClass = isLeft ? "left-0" : "right-0";

  return (
    <div className={`fixed ${containerClass} top-0 bottom-0 w-16 z-20 hidden xl:flex flex-col items-center bg-white/50 dark:bg-black/50 backdrop-blur-[2px] border-${side === 'left' ? 'r' : 'l'} border-zinc-200 dark:border-zinc-800`}>
      <div className={`absolute top-0 bottom-0 ${isLeft ? "right-1" : "left-1"} w-px bg-zinc-200 dark:bg-zinc-800`}></div>
      <div className="absolute inset-0 w-full h-full opacity-40 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>
    </div>
  );
};

export default async function WritingsLibrary({ searchParams }) {
  await dbConnect();

  // Await params (Next.js 15 requirement)
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const type = params?.type || 'ALL';
  const query = (params?.q || '').trim(); // Trim whitespace
  const limit = 12; // Items per page

  // Build Database Query
  const dbQuery = {};
  if (type !== 'ALL') dbQuery.type = type;
  if (query) {
    dbQuery.$or = [
      { title: { $regex: query, $options: 'i' } },
      { question: { $regex: query, $options: 'i' } }
    ];
  }

  // Fetch Data
  const totalItems = await Writing.countDocuments(dbQuery);
  const totalPages = Math.ceil(totalItems / limit);

  const writings = await Writing.find(dbQuery)
    .select('title type question createdAt')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const writingTypes = [
    'ALL', 'PARAGRAPH', 'STORY', 'NOTICE', 'FAMILY_CHART',
    'FORMAL_LETTER', 'INFORMAL_LETTER', 'PROCESS',
    'DIARY', 'DIALOGUE', 'SUMMARY'
  ];

  // Helper to generate pagination links
  const getPageLink = (newPage) => {
    const sp = new URLSearchParams();
    if (newPage > 1) sp.set('page', newPage);
    if (type !== 'ALL') sp.set('type', type);
    if (query) sp.set('q', query);
    return `/writings?${sp.toString()}`;
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-200 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/30 pb-20 relative">

      {/* --- BACKGROUND DESIGN SYSTEM --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         {/* 1. Linear Grid */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>

         {/* 2. Radial Dots (Texture) */}
         <div className="absolute inset-0 opacity-20 dark:opacity-20" style={{
             backgroundImage: 'radial-gradient(#888 1px, transparent 1px)',
             backgroundSize: '40px 40px'
         }}></div>

         {/* 3. Ambient Light Orbs */}
         <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-50" />
         <div className="absolute bottom-[-20%] right-[20%] w-[600px] h-[600px] bg-violet-500/10 dark:bg-violet-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-50" />
      </div>

      <GraphBorder side="left" />
      <GraphBorder side="right" />

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative z-50">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2 font-black text-lg tracking-tight">
            <Library size={20} className="text-indigo-600 dark:text-indigo-400"/>
            WRITING LIBRARY
          </div>
          <div className="w-20"></div> {/* Spacer */}
        </div>
      </header>

      {/* Main Content - FIXED: Added min-h-screen to create scrolling context */}
      <main className="relative z-30 max-w-7xl mx-auto px-6 pt-28 min-h-screen">
        {/* Changed: Added h-full to parent container */}
        <div className="h-full flex flex-col md:flex-row gap-8">

          {/* --- SIDEBAR FILTERS (STICKY) - FIXED: Completely separate sticky container --- */}
          <div className="md:w-64 flex-shrink-0">
            <div className="md:sticky md:top-28"> {/* Fixed: Direct sticky wrapper */}
              <aside className="w-full space-y-8 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 pb-6">
                {/* Search */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">Search</label>
                  <form action="/writings" method="GET" className="relative group">
                      <Search className="absolute left-3 top-3 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={16}/>
                      <input
                          name="q"
                          defaultValue={query}
                          placeholder="Search topics..."
                          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                      />
                      {/* Preserve type when searching */}
                      <input type="hidden" name="type" value={type} />

                      {query && (
                           <Link
                             href={`/writings?type=${type}`}
                             className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                           >
                               <X size={16} />
                           </Link>
                      )}
                  </form>
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">Filter by Type</label>
                  <div className="flex flex-col gap-1">
                      {writingTypes.map(t => (
                          <Link
                              key={t}
                              href={`/writings?type=${t}${query ? `&q=${query}` : ''}`}
                              className={`px-3 py-2 text-xs font-bold rounded-lg transition-all text-left flex justify-between items-center ${
                                  type === t
                                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                  : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white'
                              }`}
                          >
                              {t.replace(/_/g, ' ')}
                              {type === t && <Filter size={12}/>}
                          </Link>
                      ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>

          {/* --- MAIN CONTENT AREA (Scrollable) --- */}
          <div className="flex-1 min-w-0"> {/* Changed: Added min-w-0 for proper flex behavior */}

             {/* Title Bar */}
             <div className="mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                        {query ? (
                            <span className="flex items-center gap-2">
                                Search: <span className="text-indigo-600 dark:text-indigo-400">"{query}"</span>
                            </span>
                        ) : (
                            type === 'ALL' ? 'All Writings' : type.replace(/_/g, ' ')
                        )}
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Showing {writings.length} of {totalItems} tasks
                    </p>
                </div>

                {query && (
                    <Link href="/writings" className="text-xs font-bold text-red-500 hover:underline">
                        Clear Search
                    </Link>
                )}
             </div>

             {/* Cards Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
                {writings.length > 0 ? writings.map((item) => (
                     <Link key={item._id} href={`/writing/${item._id}`} className="group relative flex flex-col justify-between p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-300 shadow-sm hover:shadow-lg">

                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-2 py-0.5 bg-zinc-100 dark:bg-[#1a1a1a] text-[10px] font-mono border border-zinc-200 dark:border-zinc-700 rounded text-zinc-500 uppercase tracking-wider">
                                    {item.type.replace(/_/g, ' ')}
                                </span>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-50 dark:bg-[#151515] group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all">
                                    <ArrowRight size={16} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {item.title}
                            </h3>

                            <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed">
                                {item.question}
                            </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center gap-2 text-xs font-bold text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                           <FileText size={12}/> View Task
                        </div>
                     </Link>
                )) : (
                    <div className="col-span-full py-24 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20">
                        <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                            <Search size={24}/>
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No results found</h3>
                        <p className="text-zinc-500 text-sm mt-1 max-w-xs mx-auto">
                            We couldn't find any writing tasks matching "{query}". Try a different keyword or category.
                        </p>
                        {query && (
                            <Link href="/writings" className="mt-6 inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-full hover:bg-indigo-700 transition-colors">
                                Clear Filters
                            </Link>
                        )}
                    </div>
                )}
             </div>

             {/* PAGINATION CONTROLS */}
             {totalPages > 1 && (
                 <div className="flex justify-center items-center gap-3 pb-8">
                     {page > 1 ? (
                         <Link
                            href={getPageLink(page - 1)}
                            className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                         >
                            <PrevIcon size={14}/> Previous
                         </Link>
                     ) : (
                        <button disabled className="px-4 py-2 opacity-50 cursor-not-allowed border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-bold flex items-center gap-2 text-zinc-400">
                            <PrevIcon size={14}/> Previous
                        </button>
                     )}

                     <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-mono font-bold text-zinc-500">
                        {page} / {totalPages}
                     </div>

                     {page < totalPages ? (
                         <Link
                            href={getPageLink(page + 1)}
                            className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                         >
                            Next <NextIcon size={14}/>
                         </Link>
                     ) : (
                        <button disabled className="px-4 py-2 opacity-50 cursor-not-allowed border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-bold flex items-center gap-2 text-zinc-400">
                            Next <NextIcon size={14}/>
                        </button>
                     )}
                 </div>
             )}
          </div>

        </div>
      </main>
    </div>
  );
}
