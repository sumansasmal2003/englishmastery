"use client";
import { PenTool, Trash2, Lightbulb, UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  InputLabel,
  ThemedInput,
  ThemedTextarea,
} from "@/app/add-chapter/components/SharedUI";
import CircularProgress from "./CircularProgress";
import { uploadToCloudinary } from "@/lib/upload";

export default function GrammarEditor({
  form,
  setForm,
  uploadState,
  setUploadState,
  showNotification,
}) {
  // --- HANDLERS ---
  const handleCoverImageUpload = async (file) => {
    try {
      setUploadState({ target: "cover", progress: 1 });
      const url = await uploadToCloudinary(file, (p) =>
        setUploadState({ target: "cover", progress: p })
      );
      setForm((prev) => ({ ...prev, coverImage: url }));
    } catch (e) {
      showNotification("error", "Failed to upload cover image");
    } finally {
      setUploadState({ target: null, progress: 0 });
    }
  };

  const addGrammarSection = () =>
    setForm({
      ...form,
      sections: [
        ...form.sections,
        {
          title: `Rule ${form.sections.length + 1}`,
          content: "",
          examples: [],
        },
      ],
    });
  const removeGrammarSection = (i) => {
    const s = [...form.sections];
    s.splice(i, 1);
    setForm({ ...form, sections: s });
  };
  const updateSection = (i, f, v) => {
    const s = [...form.sections];
    s[i][f] = v;
    setForm({ ...form, sections: s });
  };
  const addExample = (i) => {
    const s = [...form.sections];
    s[i].examples.push({ sentence: "", explanation: "" });
    setForm({ ...form, sections: s });
  };
  const updateExample = (sI, eI, f, v) => {
    const s = [...form.sections];
    s[sI].examples[eI][f] = v;
    setForm({ ...form, sections: s });
  };
  const removeExample = (sI, eI) => {
    const s = [...form.sections];
    s[sI].examples.splice(eI, 1);
    setForm({ ...form, sections: s });
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-10"
      >
        <section className="bg-white dark:bg-zinc-900/10 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <PenTool size={16} className="text-zinc-400" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              Grammar Topic
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5">
            <div>
              <InputLabel>Topic Title</InputLabel>
              <ThemedInput
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
              />
            </div>
            <div>
              <InputLabel>Description</InputLabel>
              <ThemedTextarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Brief description of the grammar topic..."
              />
            </div>

            {/* Grammar Cover Image Upload */}
            <div className="col-span-1">
              <InputLabel>Cover Image (Optional)</InputLabel>
              <div className="flex items-center gap-4 mt-2">
                {form.coverImage && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 group">
                    <img
                      src={form.coverImage}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, coverImage: "" }))
                      }
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
                <label
                  className={`flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg cursor-pointer transition-colors text-xs font-bold text-zinc-600 dark:text-zinc-300 ${
                    uploadState.target ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {uploadState.target === "cover" ? (
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                      <CircularProgress percentage={uploadState.progress} />
                      <span>{uploadState.progress}%</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={14} />
                      <span>
                        {form.coverImage ? "Change Cover" : "Upload Cover"}
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleCoverImageUpload(e.target.files[0])}
                    disabled={!!uploadState.target}
                  />
                </label>
              </div>
            </div>
          </div>
        </section>

        {form.sections.map((sec, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 relative"
          >
            <div className="flex gap-4 mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex-1">
                <InputLabel>Rule Title</InputLabel>
                <ThemedInput
                  value={sec.title}
                  onChange={(e) => updateSection(idx, "title", e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeGrammarSection(idx)}
                className="mt-6 p-2 text-zinc-400 hover:text-black dark:hover:text-white"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div className="mb-6">
              <InputLabel>Explanation</InputLabel>
              <ThemedTextarea
                value={sec.content}
                onChange={(e) => updateSection(idx, "content", e.target.value)}
              />
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1">
                  <Lightbulb size={12} /> Examples
                </span>
                <button
                  type="button"
                  onClick={() => addExample(idx)}
                  className="text-[10px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-black dark:hover:text-white shadow-sm"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-3">
                {sec.examples.map((ex, exIdx) => (
                  <div key={exIdx} className="flex gap-2 items-start">
                    <div className="flex-1 grid gap-2">
                      <input
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1.5 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                        placeholder="Sentence..."
                        value={ex.sentence}
                        onChange={(e) =>
                          updateExample(idx, exIdx, "sentence", e.target.value)
                        }
                      />
                      <input
                        className="w-full bg-transparent border-b border-dashed border-zinc-300 dark:border-zinc-700 px-2 py-1 text-xs text-zinc-500 outline-none"
                        placeholder="Why is this correct? (Optional)"
                        value={ex.explanation}
                        onChange={(e) =>
                          updateExample(idx, exIdx, "explanation", e.target.value)
                        }
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExample(idx, exIdx)}
                      className="p-1 text-zinc-400 hover:text-black dark:hover:text-white"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
        <button
          type="button"
          onClick={addGrammarSection}
          className="w-full py-4 border border-dashed border-zinc-300 rounded-xl text-zinc-500 text-sm hover:bg-zinc-50 hover:text-black transition-colors"
        >
          + Add New Rule
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
