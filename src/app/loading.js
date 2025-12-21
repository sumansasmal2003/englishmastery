import { BookOpen, Command, Search, GraduationCap, Sparkles, PenTool } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans relative overflow-hidden">

      {/* --- Header Skeleton --- */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse flex items-center justify-center">
             <BookOpen size={16} className="text-zinc-400 opacity-50" />
          </div>
          <div className="w-32 h-6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="w-24 h-8 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-24">

        {/* --- Hero / Search Skeleton --- */}
        <div className="max-w-2xl mx-auto text-center mb-24 space-y-8">
          <div className="space-y-4 flex flex-col items-center">
            <div className="w-3/4 h-16 sm:h-20 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
            <div className="w-1/2 h-16 sm:h-20 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse delay-75" />
          </div>
          <div className="w-64 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto animate-pulse delay-100" />

          <div className="relative max-w-md mx-auto h-12 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 animate-pulse mt-8" />
        </div>

        <div className="space-y-24">

            {/* 1. ACADEMIC SECTION SKELETON */}
            <section>
                <div className="flex items-end justify-between mb-6 px-1 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                    <div className="flex items-center gap-3">
                        <GraduationCap className="text-zinc-300 dark:text-zinc-700" size={20} />
                        <div className="w-48 h-6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-40 p-6 w-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col justify-between animate-pulse">
                            <div className="flex justify-between w-full">
                                <div className="w-20 h-3 bg-zinc-200 dark:bg-zinc-800 rounded" />
                                <div className="w-12 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                            </div>
                            <div className="space-y-2">
                                <div className="w-16 h-10 bg-zinc-200 dark:bg-zinc-800 rounded" />
                                <div className="w-24 h-3 bg-zinc-200 dark:bg-zinc-800 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 2. GRAMMAR SECTION SKELETON */}
            <section>
                <div className="flex items-center gap-3 mb-6 px-1 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                    <Sparkles className="text-zinc-300 dark:text-zinc-700" size={20} />
                    <div className="w-48 h-6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg animate-pulse">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-8 h-8 rounded bg-zinc-200 dark:bg-zinc-800" />
                            </div>
                            <div className="space-y-2">
                                <div className="w-3/4 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                                <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

        </div>

      </main>
    </div>
  );
}
