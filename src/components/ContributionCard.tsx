import React from "react";

interface PRProps {
  title: string;
  url: string;
  repoName: string;
  date: string;
}

export const ContributionCard: React.FC<PRProps> = ({ title, url, repoName, date }) => {
  return (
    <a
      href={url}
      target="_blank"
      className="group block p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:ring-2 hover:ring-blue-500 transition-all shadow-sm"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full uppercase tracking-wider">
          {repoName}
        </span>
        <span className="text-xs text-slate-400 font-mono">
          {new Date(date).toLocaleDateString("ja-JP")}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors line-clamp-2">
        {title}
      </h3>
    </a>
  );
};
