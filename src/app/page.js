import dbConnect from "@/lib/db";
import Chapter from "@/models/Chapter";
import Grammar from "@/models/Grammar";
import ClassInfo from "@/models/ClassInfo";
import Writing from "@/models/Writing";
import HomeDashboard from "@/components/HomeDashboard";

export const dynamic = 'force-dynamic';

export default async function Home() {
  await dbConnect();

  const chapters = await Chapter.find({})
    .select('title author classLevel chapterNumber _id')
    .sort({ classLevel: 1, chapterNumber: 1 })
    .lean();

  const grammar = await Grammar.find({})
    .select('topic description _id')
    .sort({ topic: 1 })
    .lean();

  // --- OPTIMIZATION: Fetch only 6 latest items ---
  const writings = await Writing.find({})
    .select('title type question _id')
    .sort({ createdAt: -1 })
    .limit(6) // Limit to 6 items
    .lean();

  const classInfos = await ClassInfo.find({})
    .select('classLevel coverImage _id')
    .lean();

  const serializedChapters = chapters.map(doc => ({ ...doc, _id: doc._id.toString() }));
  const serializedGrammar = grammar.map(doc => ({ ...doc, _id: doc._id.toString() }));
  const serializedWritings = writings.map(doc => ({ ...doc, _id: doc._id.toString() }));
  const serializedClassInfos = classInfos.map(doc => ({ ...doc, _id: doc._id.toString() }));

  return (
    <HomeDashboard
      chapters={serializedChapters}
      grammar={serializedGrammar}
      writings={serializedWritings}
      classInfos={serializedClassInfos}
    />
  );
}
