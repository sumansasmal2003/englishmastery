import dbConnect from "@/lib/db";
import Writing from "@/models/Writing";
import {
  ArrowLeft, FileText, MapPin, Calendar, User, Feather, Lightbulb, Network,
  MessageSquare, Users, Eye, EyeOff
} from "lucide-react";
import Link from "next/link";
import ClientWritingViewer from "./ClientWritingViewer"; // We'll make this client component
import RelatedContent from "@/components/RelatedContent";

export const dynamic = 'force-dynamic';

export default async function WritingDetailPage({ params }) {
  await dbConnect();

  // Await params for Next.js 15
  const { id } = await params;

  const writing = await Writing.findById(id).lean();

  if (!writing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-zinc-500">
        Writing task not found.
      </div>
    );
  }

  const relatedDocs = await Writing.find({
      type: writing.type,
      _id: { $ne: id } // Exclude current
  })
  .select('title question type')
  .limit(3)
  .lean();

  const relatedItems = relatedDocs.map(doc => ({
      title: doc.title,
      subtitle: doc.question,
      category: doc.type.replace(/_/g, ' '),
      href: `/writing/${doc._id.toString()}`
  }));

  // Serialize ID
  const serializedWriting = { ...writing, _id: writing._id.toString() };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-200 font-sans selection:bg-rose-500/30">

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back
          </Link>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-500">
             <Feather size={16} />
             <span className="text-xs font-bold uppercase tracking-widest">Writing Studio</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">

        {/* Title Section */}
        <div className="mb-12 text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-4 border border-rose-200 dark:border-rose-900/50">
                {writing.type.replace(/_/g, ' ')}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white leading-tight">
                {writing.title}
            </h1>
        </div>

        {/* Client Viewer for Interactivity (Toggle Answers) */}
        <ClientWritingViewer writing={serializedWriting} />

        <div className="mt-16">
            <RelatedContent
                title={`More ${writing.type.replace(/_/g, ' ').toLowerCase()}s`}
                items={relatedItems}
            />
        </div>

      </main>
    </div>
  );
}
