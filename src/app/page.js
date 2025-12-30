import dbConnect from "@/lib/db";
import Chapter from "@/models/Chapter";
import Grammar from "@/models/Grammar";
import ClassInfo from "@/models/ClassInfo";
import Writing from "@/models/Writing"; // Import Writing Model
import HomeDashboard from "@/components/HomeDashboard";

export const dynamic = 'force-dynamic';

export default async function Home() {
  await dbConnect();

  // 1. Fetch Chapters
  const chapters = await Chapter.find({})
    .select('title author classLevel chapterNumber _id')
    .sort({ classLevel: 1, chapterNumber: 1 })
    .lean();

  // 2. Fetch Grammar
  const grammar = await Grammar.find({})
    .select('topic description _id')
    .sort({ topic: 1 })
    .lean();

  // 3. Fetch Writings (NEW)
  const writings = await Writing.find({})
    .select('title type question _id')
    .sort({ type: 1, createdAt: -1 })
    .lean();

  // 4. Fetch Class Images
  const classInfos = await ClassInfo.find({})
    .select('classLevel coverImage _id')
    .lean();

  // Serialization
  const serializedChapters = chapters.map(doc => ({ ...doc, _id: doc._id.toString() }));
  const serializedGrammar = grammar.map(doc => ({ ...doc, _id: doc._id.toString() }));
  const serializedWritings = writings.map(doc => ({ ...doc, _id: doc._id.toString() }));
  const serializedClassInfos = classInfos.map(doc => ({ ...doc, _id: doc._id.toString() }));

  return (
    <HomeDashboard
      chapters={serializedChapters}
      grammar={serializedGrammar}
      writings={serializedWritings} // Pass to component
      classInfos={serializedClassInfos}
    />
  );
}
