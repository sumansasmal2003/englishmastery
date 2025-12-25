import dbConnect from "@/lib/db";
import Chapter from "@/models/Chapter";
import Grammar from "@/models/Grammar";
import ClassInfo from "@/models/ClassInfo"; // Import the new model
import HomeDashboard from "@/components/HomeDashboard";

export const dynamic = 'force-dynamic';

export default async function Home() {
  await dbConnect();

  const chapters = await Chapter.find({}).sort({ classLevel: 1, chapterNumber: 1 }).lean();
  const grammar = await Grammar.find({}).sort({ topic: 1 }).lean();
  // Fetch Class Info
  const classInfos = await ClassInfo.find({}).lean();

  const serializedChapters = JSON.parse(JSON.stringify(chapters));
  const serializedGrammar = JSON.parse(JSON.stringify(grammar));
  const serializedClassInfos = JSON.parse(JSON.stringify(classInfos));

  return (
    <HomeDashboard
      chapters={serializedChapters}
      grammar={serializedGrammar}
      classInfos={serializedClassInfos} // Pass it down
    />
  );
}
