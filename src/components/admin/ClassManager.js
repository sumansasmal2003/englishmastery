"use client";
import { LayoutGrid, Image as ImageIcon, UploadCloud } from "lucide-react";
import { uploadToCloudinary } from "@/lib/upload";
import CircularProgress from "./CircularProgress";

export default function ClassManager({
  classInfos = [],
  onRefresh,
  uploadState,
  setUploadState,
  showNotification,
}) {
  const classes = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const handleClassImageUpload = async (classLevel, file) => {
    try {
      setUploadState({ target: `class-${classLevel}`, progress: 1 });

      const url = await uploadToCloudinary(file, (percent) => {
        setUploadState({ target: `class-${classLevel}`, progress: percent });
      });

      // Save to DB immediately
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classLevel, coverImage: url }),
      });
      const data = await res.json();

      if (data.success) {
        showNotification("success", `Class ${classLevel} image updated`);
        if (onRefresh) onRefresh();
      } else {
        showNotification("error", data.error);
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Upload failed");
    } finally {
      setUploadState({ target: null, progress: 0 });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <LayoutGrid size={16} className="text-zinc-400" />
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
          Manage Class Covers
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {classes.map((cls) => {
          const info = classInfos.find((i) => i.classLevel === cls);
          const isUploading = uploadState.target === `class-${cls}`;

          return (
            <div
              key={cls}
              className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-lg font-bold text-zinc-900 dark:text-white">
                Class {cls}
              </div>

              <div className="relative w-full aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                {info?.coverImage ? (
                  <img
                    src={info.coverImage}
                    alt={`Class ${cls}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <ImageIcon size={24} opacity={0.5} />
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                    <CircularProgress percentage={uploadState.progress} />
                  </div>
                )}
              </div>

              <label
                className={`w-full py-2 flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity ${
                  isUploading ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <UploadCloud size={14} />
                <span>{info?.coverImage ? "Change" : "Upload"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleClassImageUpload(cls, e.target.files[0])
                  }
                  disabled={isUploading}
                />
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
