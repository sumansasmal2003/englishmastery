"use client";
import {
  FileText, Trash2, UploadCloud, AlignLeft, X, Layers, Plus, PenTool, ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  InputLabel,
  ThemedInput,
  ThemedTextarea,
} from "@/app/add-chapter/components/SharedUI";
import ActivityBuilder from "@/app/add-chapter/components/ActivityBuilder";
import WritingBuilder from "@/app/add-chapter/components/WritingBuilder";
import CircularProgress from "./CircularProgress";
import { uploadToCloudinary } from "@/lib/upload";

export default function ChapterEditor({
  form,
  setForm,
  uploadState,
  setUploadState,
  showNotification,
}) {
  // --- UPLOAD HANDLERS ---
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

  const handleParagraphImageUpload = async (unitIdx, pIdx, file) => {
    const targetId = `u-${unitIdx}-p-${pIdx}`;
    try {
      setUploadState({ target: targetId, progress: 1 });
      const url = await uploadToCloudinary(file, (p) =>
        setUploadState({ target: targetId, progress: p })
      );
      updateParagraph(unitIdx, pIdx, "image", url);
    } catch (e) {
      showNotification("error", "Failed to upload image");
    } finally {
      setUploadState({ target: null, progress: 0 });
    }
  };

  // --- UNIT HANDLERS ---
  const addUnit = () =>
    setForm({
      ...form,
      units: [
        ...form.units,
        {
          title: `Unit ${form.units.length + 1}`,
          paragraphs: [],
          activities: [],
          writings: [],
        },
      ],
    });

  const updateUnitTitle = (i, v) => {
    const u = [...form.units];
    u[i].title = v;
    setForm({ ...form, units: u });
  };

  const removeUnit = (i) => {
    const u = [...form.units];
    u.splice(i, 1);
    setForm({ ...form, units: u });
  };

  // --- PARAGRAPH HANDLERS ---
  const addParagraph = (i) => {
    const u = [...form.units];
    u[i].paragraphs.push({ english: "", bengali: "", image: "" });
    setForm({ ...form, units: u });
  };
  const updateParagraph = (i, p, f, v) => {
    const u = [...form.units];
    u[i].paragraphs[p][f] = v;
    setForm({ ...form, units: u });
  };
  const removeParagraph = (i, p) => {
    const u = [...form.units];
    u[i].paragraphs.splice(p, 1);
    setForm({ ...form, units: u });
  };

  // --- ACTIVITY HANDLERS ---
  const addActivityGroup = (unitIdx, type) => {
    const u = [...form.units];
    if (!u[unitIdx].activities) u[unitIdx].activities = [];
    const defaultInstr = {
      MCQ: "Choose the correct answer:",
      TRUE_FALSE: "Write 'T' for true and 'F' for false:",
      MATCHING: "Match Column A with Column B:",
      FILL_BLANKS: "Fill in the blanks:",
      WORD_BOX: "Fill in the blanks using words from the box:",
      REARRANGE: "Rearrange the following sentences:",
      UNDERLINE: "Underline the correct words:",
      UNDERLINE_CIRCLE: "Underline countable nouns and Circle uncountable nouns:",
      CATEGORIZE: "Put the underlined words in the correct columns:",
      CAUSE_EFFECT: "Complete the table:",
      QA: "Answer the following questions:",
    };

    u[unitIdx].activities.push({
      type,
      instruction: defaultInstr[type] || "Complete the activity:",
      questions: [],
      columnHeaders: [],
    });
    setForm({ ...form, units: u });
  };

  const updateActivity = (unitIdx, actIdx, newActivity) => {
    const u = [...form.units];
    u[unitIdx].activities[actIdx] = newActivity;
    setForm({ ...form, units: u });
  };

  const removeActivity = (unitIdx, actIdx) => {
    const u = [...form.units];
    u[unitIdx].activities.splice(actIdx, 1);
    setForm({ ...form, units: u });
  };

  // --- WRITING HANDLERS ---
  const addWritingTask = (unitIdx, type) => {
    const u = [...form.units];
    if (!u[unitIdx].writings) u[unitIdx].writings = [];
    let initialData = { wordLimit: "100 words" };
    let defaultQuestion = "Write a...";

    if (type === "FAMILY_CHART") {
      defaultQuestion = "Describe the relationships based on the chart.";
      initialData = {
        familyMembers: [
          {
            id: "root",
            parentId: null,
            partnerId: null,
            name: "Grandfather",
            relation: "Head",
            details: "Age 70",
          },
        ],
      };
    } else if (["STORY", "PARAGRAPH", "NOTICE"].includes(type)) {
      initialData.hints = ["Point 1", "Point 2"];
    } else if (type === "DIALOGUE") {
      defaultQuestion = "Write a dialogue between...";
      initialData.characters = ["Person A", "Person B"];
      initialData.setting = "Scene context...";
    } else if (type === "SUMMARY") {
      defaultQuestion = "Write a summary of the following passage.";
      initialData.passage = "Paste text here...";
      initialData.wordLimit = "Approx. 50 words";
    }

    u[unitIdx].writings.push({
      type: type,
      question: defaultQuestion,
      data: initialData,
      modelAnswer: "",
    });
    setForm({ ...form, units: u });
  };

  const updateWriting = (unitIdx, wIdx, newWriting) => {
    const u = [...form.units];
    u[unitIdx].writings[wIdx] = newWriting;
    setForm({ ...form, units: u });
  };

  const removeWriting = (unitIdx, wIdx) => {
    const u = [...form.units];
    u[unitIdx].writings.splice(wIdx, 1);
    setForm({ ...form, units: u });
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-10"
      >
        {/* 1. Metadata */}
        <section className="bg-white dark:bg-zinc-900/10 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <FileText size={16} className="text-zinc-400" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              Chapter Metadata
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="col-span-1">
              <InputLabel>Class Level</InputLabel>
              <ThemedInput
                type="number"
                value={form.classLevel}
                onChange={(e) => setForm({ ...form, classLevel: e.target.value })}
              />
            </div>
            <div className="col-span-1">
              <InputLabel>Chapter No.</InputLabel>
              <ThemedInput
                type="number"
                value={form.chapterNumber}
                onChange={(e) =>
                  setForm({ ...form, chapterNumber: e.target.value })
                }
              />
            </div>
            <div className="col-span-2">
              <InputLabel>Author Name</InputLabel>
              <ThemedInput
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
            </div>
            <div className="col-span-4">
              <InputLabel>Chapter Title</InputLabel>
              <ThemedInput
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="text-lg font-medium"
              />
            </div>

            {/* Cover Image Upload */}
            <div className="col-span-4">
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
                      onClick={() => setForm((prev) => ({ ...prev, coverImage: "" }))}
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

        {/* 2. Units Loop */}
        {form.units?.map((unit, uIdx) => (
          <motion.div
            key={uIdx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 relative shadow-sm dark:shadow-none"
          >
            <div className="flex gap-4 mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex-1">
                <InputLabel>Unit Title</InputLabel>
                <ThemedInput
                  value={unit.title}
                  onChange={(e) => updateUnitTitle(uIdx, e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeUnit(uIdx)}
                className="mt-6 p-2 text-zinc-400 hover:text-black dark:hover:text-white rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Paragraphs */}
            <div className="space-y-5 mb-8">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <AlignLeft size={14} /> Text Content
              </h3>
              {unit.paragraphs?.map((p, pIdx) => (
                <div
                  key={pIdx}
                  className="space-y-3 group bg-zinc-50/50 dark:bg-zinc-900/20 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <ThemedTextarea
                      value={p.english}
                      onChange={(e) =>
                        updateParagraph(uIdx, pIdx, "english", e.target.value)
                      }
                      placeholder="English text..."
                    />
                    <div className="relative">
                      <ThemedTextarea
                        value={p.bengali}
                        onChange={(e) =>
                          updateParagraph(uIdx, pIdx, "bengali", e.target.value)
                        }
                        placeholder="Bengali translation..."
                      />
                      <button
                        type="button"
                        onClick={() => removeParagraph(uIdx, pIdx)}
                        className="absolute top-2 right-2 p-1 text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  {/* Paragraph Image Upload */}
                  <div className="flex items-center gap-3 pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                    {p.image ? (
                      <div className="flex items-center gap-3 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                        <img
                          src={p.image}
                          alt="Paragraph visual"
                          className="w-12 h-12 object-cover rounded-md"
                        />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            Image Attached
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateParagraph(uIdx, pIdx, "image", "")
                            }
                            className="text-[10px] text-red-500 hover:underline text-left"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label
                        className={`flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md cursor-pointer hover:border-zinc-400 transition-all text-[10px] font-bold text-zinc-500 hover:text-black dark:hover:text-white ${
                          uploadState.target
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {uploadState.target === `u-${uIdx}-p-${pIdx}` ? (
                          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                            <CircularProgress
                              percentage={uploadState.progress}
                              size={14}
                              strokeWidth={2}
                            />
                            <span>{uploadState.progress}%</span>
                          </div>
                        ) : (
                          <>
                            <ImageIcon size={12} />
                            <span>Add Illustration</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleParagraphImageUpload(
                              uIdx,
                              pIdx,
                              e.target.files[0]
                            )
                          }
                          disabled={!!uploadState.target}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addParagraph(uIdx)}
                className="w-full py-2.5 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-500 hover:text-black dark:hover:text-white hover:border-zinc-400 transition-colors"
              >
                + Add Paragraph Block
              </button>
            </div>

            {/* Activities */}
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/50 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <Layers size={14} /> Interactive Activities
                </h3>
                <div className="group relative z-20">
                  <button
                    type="button"
                    className="text-xs font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <Plus size={14} /> Add Activity
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 flex flex-col p-1 transform origin-top-right scale-95 group-hover:scale-100 max-h-60 overflow-y-auto custom-scrollbar">
                    {[
                      "MCQ",
                      "TRUE_FALSE",
                      "MATCHING",
                      "FILL_BLANKS",
                      "WORD_BOX",
                      "REARRANGE",
                      "UNDERLINE",
                      "UNDERLINE_CIRCLE",
                      "CATEGORIZE",
                      "CAUSE_EFFECT",
                      "QA",
                      "CHART_FILL",
                    ].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => addActivityGroup(uIdx, type)}
                        className="text-left px-3 py-2 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-300 flex items-center gap-2 hover:text-black dark:hover:text-white"
                      >
                        {type.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {unit.activities?.map((act, actIdx) => (
                  <ActivityBuilder
                    key={actIdx}
                    unitIdx={uIdx}
                    actIdx={actIdx}
                    activity={act}
                    onChange={(newAct) => updateActivity(uIdx, actIdx, newAct)}
                    onRemove={() => removeActivity(uIdx, actIdx)}
                  />
                ))}
              </div>
            </div>

            {/* Writing Skills */}
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <PenTool size={14} /> Writing Studio
                </h3>
                <div className="group relative z-20">
                  <button
                    type="button"
                    className="text-xs font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <Plus size={14} /> Add Writing Task
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 flex flex-col p-1 transform origin-top-right scale-95 group-hover:scale-100 max-h-60 overflow-y-auto custom-scrollbar">
                    {[
                      "PARAGRAPH",
                      "STORY",
                      "NOTICE",
                      "FAMILY_CHART",
                      "FORMAL_LETTER",
                      "INFORMAL_LETTER",
                      "PROCESS",
                      "DIARY",
                      "DIALOGUE",
                      "SUMMARY",
                    ].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => addWritingTask(uIdx, type)}
                        className="text-left px-3 py-2 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white"
                      >
                        {type
                          .replace(/_/g, " ")
                          .toLowerCase()
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {unit.writings?.map((write, wIdx) => (
                  <WritingBuilder
                    key={wIdx}
                    unitIdx={uIdx}
                    wIdx={wIdx}
                    writing={write}
                    onChange={(newWrite) => updateWriting(uIdx, wIdx, newWrite)}
                    onRemove={() => removeWriting(uIdx, wIdx)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ))}

        <button
          type="button"
          onClick={addUnit}
          className="w-full py-6 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-black dark:hover:text-white transition-all flex flex-col items-center gap-2"
        >
          <Plus size={24} /> <span className="text-sm font-bold">Create New Unit</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
