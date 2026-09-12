import React from "react";
import { useFeatureFlags } from "../lib/remoteConfig";

export interface TimelineItem {
  id?: string;
  date: string;
  title: string;
  description: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

const DOT_GRADIENTS = [
  "from-blue-500 to-cyan-400",
  "from-violet-500 to-fuchsia-400",
  "from-emerald-500 to-teal-400",
  "from-orange-500 to-amber-400",
];

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  const { flags } = useFeatureFlags();

  const visibleItems = items.filter((item) => {
    if (item.id === "fast-retailing" && !flags.showFastRetailing) return false;
    return true;
  });

  return (
    <div className="py-20 px-4 max-w-2xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <div className="relative">
        <div className="absolute left-[7px] top-3 bottom-3 w-px bg-gradient-to-b from-gray-300 via-gray-200 to-transparent dark:from-gray-700 dark:via-gray-800" />

        <div className="space-y-8">
          {visibleItems.map((item, index) => (
            <div key={item.id ?? index} className="relative pl-10">
              <span
                className={`absolute left-0 top-2 w-4 h-4 rounded-full bg-gradient-to-br ${DOT_GRADIENTS[index % DOT_GRADIENTS.length]} ring-4 ring-gray-50 dark:ring-gray-950`}
              />

              <div className="group rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300">
                <span className="inline-block text-xs font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full mb-3">
                  {item.date}
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
