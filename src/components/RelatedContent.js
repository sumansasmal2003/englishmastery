"use client";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function RelatedContent({ title, items, type }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mt-24 pt-12 border-t border-zinc-200 dark:border-zinc-900">
      <div className="flex items-center gap-2 mb-8">
        <Sparkles className="text-indigo-500" size={20} />
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{title}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className="group block p-6 bg-zinc-50 dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                {item.category}
              </span>
              <ArrowRight size={16} className="text-zinc-400 group-hover:text-indigo-500 -rotate-45 group-hover:rotate-0 transition-all duration-300" />
            </div>

            <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {item.title}
            </h4>

            {item.subtitle && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                {item.subtitle}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
