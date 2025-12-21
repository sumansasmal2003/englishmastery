import { Layers, ImageIcon } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-zinc-900 dark:text-zinc-200 relative overflow-hidden">

      {/* --- Header Skeleton --- */}
      <header className="fixed top-0 inset-x-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-black/60 backdrop-blur-md h-16 flex items-center px-6 justify-between">
         <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse"/>
            <div className="space-y-2">
               <div className="w-20 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse"/>
               <div className="w-40 h-4 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse"/>
            </div>
         </div>
         <div className="w-24 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse"/>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">

         {/* --- Hero Image Skeleton --- */}
         <div className="flex flex-col gap-4 mb-24">
            <div className="w-full h-[55vh] min-h-[400px] rounded-[2rem] bg-zinc-100 dark:bg-zinc-900 animate-pulse flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                <ImageIcon className="w-16 h-16 text-zinc-300 dark:text-zinc-800 opacity-50" />
            </div>
         </div>

         {/* --- Units Loop Skeleton --- */}
         {[1, 2].map(i => (
            <div key={i} className="mb-24 space-y-12">
               {/* Unit Title */}
               <div className="flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse flex items-center justify-center">
                      <Layers className="text-zinc-300 dark:text-zinc-800" size={24} />
                  </div>
                  <div className="space-y-3">
                     <div className="w-16 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse"/>
                     <div className="w-64 h-8 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse"/>
                  </div>
               </div>

               {/* Paragraph Cards */}
               <div className="space-y-8">
                  {[1, 2].map(j => (
                     <div key={j} className="h-96 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 overflow-hidden grid md:grid-cols-2 animate-pulse shadow-sm">
                        <div className="p-12 space-y-6">
                           <div className="w-full h-4 rounded bg-zinc-200 dark:bg-zinc-800"/>
                           <div className="w-11/12 h-4 rounded bg-zinc-200 dark:bg-zinc-800"/>
                           <div className="w-4/5 h-4 rounded bg-zinc-200 dark:bg-zinc-800"/>
                           <div className="w-full h-4 rounded bg-zinc-200 dark:bg-zinc-800"/>
                        </div>
                        <div className="hidden md:block p-12 space-y-6 bg-zinc-50 dark:bg-[#0c0c0c] border-l border-zinc-100 dark:border-zinc-800">
                           <div className="w-full h-4 rounded bg-zinc-200 dark:bg-zinc-800"/>
                           <div className="w-3/4 h-4 rounded bg-zinc-200 dark:bg-zinc-800"/>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         ))}
      </main>
    </div>
  );
}
