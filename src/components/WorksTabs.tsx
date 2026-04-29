import React, { useState } from "react";

interface GitHubItem {
  title: string;
  url: string;
  createdAt: string;
  repository: {
    name: string;
  };
}

interface Product {
  title: string;
  description: string;
  url: string;
  tech: string[];
}

interface WorksTabsProps {
  products: Product[];
  contributions: {
    prs: GitHubItem[];
    issues: GitHubItem[];
    reviews: GitHubItem[];
  };
  techStack: { name: string; repo: string }[];
}

const ContributionCard = ({
  title,
  url,
  repoName,
  date,
}: {
  title: string;
  url: string;
  repoName: string;
  date: string;
}) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="block p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
  >
    <div className="text-xs text-blue-500 mb-1 font-mono">{repoName}</div>
    <h4 className="font-bold text-slate-800 dark:text-white leading-snug">
      {title}
    </h4>
    <div className="text-[10px] text-slate-400 mt-2">
      {new Date(date).toLocaleDateString()}
    </div>
  </a>
);

export const WorksTabs: React.FC<WorksTabsProps> = ({
  products,
  contributions,
  techStack,
}) => {
  const [activeTab, setActiveTab] = useState<"product" | "contribution">(
    "product",
  );
  const [subTab, setSubTab] = useState<"prs" | "issues" | "reviews">("prs");

  const tabs = [
    { id: "product", label: "Product" },
    { id: "contribution", label: "OSS Contribution" },
  ] as const;

  // subTabsの定義部分を修正
  const subTabs = [
    {
      id: "prs",
      label: "PRs",
      count: contributions.prs.filter((item) =>
        techStack.some((tech) =>
          item.repository.name.toLowerCase().includes(tech.repo.toLowerCase()),
        ),
      ).length,
    },
    {
      id: "issues",
      label: "Issues",
      count: contributions.issues.filter((item) =>
        techStack.some((tech) =>
          item.repository.name.toLowerCase().includes(tech.repo.toLowerCase()),
        ),
      ).length,
    },
    {
      id: "reviews",
      label: "Reviews",
      count: contributions.reviews.filter((item) =>
        techStack.some((tech) =>
          item.repository.name.toLowerCase().includes(tech.repo.toLowerCase()),
        ),
      ).length,
    },
  ] as const;

  return (
    <div>
      {/* メインタブ */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg w-fit mb-12">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2 text-sm font-bold rounded-md transition-all ${
              activeTab === tab.id
                ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- Product セクション --- */}
      {activeTab === "product" && (
        <div className="animate-in fade-in duration-500 grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
            >
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                {product.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                {product.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {product.tech.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-mono text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded border border-slate-100 dark:border-slate-800"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 text-sm font-medium hover:underline"
              >
                View Project →
              </a>
            </div>
          ))}
        </div>
      )}

      {/* --- Contribution セクション --- */}
      {activeTab === "contribution" && (
        <div className="animate-in fade-in duration-500">
          {/* サブタブ (PRs / Issues / Reviews) */}
          <div className="flex gap-4 mb-8 border-b border-slate-100 dark:border-slate-800">
            {subTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                className={`pb-4 text-sm font-bold transition-all relative ${
                  subTab === tab.id
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab.label}
                <span className="ml-2 text-xs opacity-50 font-mono">
                  {tab.count}
                </span>
                {subTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                )}
              </button>
            ))}
          </div>

          <div className="space-y-16">
            {techStack.map((tech) => {
              // 現在のサブタブに対応するデータをフィルタリング
              const currentData = contributions[subTab];
              const filteredItems = currentData.filter((item) =>
                item.repository.name
                  .toLowerCase()
                  .includes(tech.repo.toLowerCase()),
              );

              if (filteredItems.length === 0) return null;

              return (
                <section key={tech.repo}>
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 italic">
                      {tech.name}
                    </h2>
                    <div className="h-[1px] flex-grow bg-slate-100 dark:bg-slate-800"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredItems.map((item) => (
                      <ContributionCard
                        key={item.url}
                        title={item.title}
                        url={item.url}
                        repoName={item.repository.name}
                        date={item.createdAt}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {contributions[subTab].length === 0 && (
              <div className="py-20 text-center text-slate-400">
                No {subTab} found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
