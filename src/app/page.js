import dbConnect from "@/lib/db";
import Chapter from "@/models/Chapter";
import Grammar from "@/models/Grammar";
import HomeDashboard from "@/components/HomeDashboard";

// Force dynamic because we want to see new chapters immediately
export const dynamic = 'force-dynamic';

export default async function Home() {
  await dbConnect();

  // Fetch data with .lean() for performance and to get plain JS objects
  const chapters = await Chapter.find({}).sort({ classLevel: 1, chapterNumber: 1 }).lean();
  const grammar = await Grammar.find({}).sort({ topic: 1 }).lean();

  // Serialization trick for MongoDB IDs
  const serializedChapters = JSON.parse(JSON.stringify(chapters));
  const serializedGrammar = JSON.parse(JSON.stringify(grammar));

  return (
    <HomeDashboard
      chapters={serializedChapters}
      grammar={serializedGrammar}
    />
  );
}
