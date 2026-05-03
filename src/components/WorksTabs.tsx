import React, { useState } from "react";
import astroLogo from "../assets/astro-icon-light-gradient.png";
import qwikLogo from "../assets/qwik.png";
import yamadaLogo from "../assets/yamada ui.png";
import dioxusLogo from "../assets/dioxus.png";

const REPO_LOGOS: Record<string, { src: string }> = {
  astro: astroLogo,
  docs: astroLogo,
  qwik: qwikLogo,
  "yamada-ui": yamadaLogo,
  dioxus: dioxusLogo,
  docsite: dioxusLogo,
};

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

type SubTabId = "prs" | "issues" | "reviews";

const filterByRepo = (items: GitHubItem[], repo: string) =>
  items.filter((item) =>
    item.repository.name.toLowerCase().includes(repo.toLowerCase()),
  );

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

const RepoLogo = ({ repo, size = 24 }: { repo: string; size?: number }) => {
  const logo = REPO_LOGOS[repo];
  if (!logo) return null;
  return (
    <img
      src={logo.src}
      alt=""
      width={size}
      height={size}
      className="object-contain shrink-0"
    />
  );
};

const RepoCard = ({
  name,
  repo,
  prCount,
  issueCount,
  reviewCount,
  onClick,
}: {
  name: string;
  repo: string;
  prCount: number;
  issueCount: number;
  reviewCount: number;
  onClick: () => void;
}) => {
  const total = prCount + issueCount + reviewCount;
  return (
    <button
      onClick={onClick}
      className="group text-left p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <RepoLogo repo={repo} size={24} />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-blue-500 transition-colors">
            {name}
          </h3>
        </div>
        <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-full">
          {total} total
        </span>
      </div>
      <div className="flex gap-3">
        {[
          { label: "PRs", count: prCount },
          { label: "Issues", count: issueCount },
          { label: "Reviews", count: reviewCount },
        ].map(({ label, count }) => (
          <div key={label} className="flex flex-col items-center">
            <span className="text-xl font-black text-slate-700 dark:text-slate-200">
              {count}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        View contributions →
      </div>
    </button>
  );
};

export const WorksTabs: React.FC<WorksTabsProps> = ({
  products,
  contributions,
  techStack,
}) => {
  const [activeTab, setActiveTab] = useState<"product" | "contribution">(
    "product",
  );
  const [selectedRepo, setSelectedRepo] = useState<{
    name: string;
    repo: string;
  } | null>(null);
  const [subTab, setSubTab] = useState<SubTabId>("prs");

  const tabs = [
    { id: "product", label: "Product" },
    { id: "contribution", label: "OSS Contribution" },
  ] as const;

  const handleRepoSelect = (tech: { name: string; repo: string }) => {
    setSelectedRepo(tech);
    setSubTab("prs");
  };

  const handleBack = () => {
    setSelectedRepo(null);
  };

  const subTabs = selectedRepo
    ? ([
        {
          id: "prs" as SubTabId,
          label: "PRs",
          count: filterByRepo(contributions.prs, selectedRepo.repo).length,
        },
        {
          id: "issues" as SubTabId,
          label: "Issues",
          count: filterByRepo(contributions.issues, selectedRepo.repo).length,
        },
        {
          id: "reviews" as SubTabId,
          label: "Reviews",
          count: filterByRepo(contributions.reviews, selectedRepo.repo).length,
        },
      ] as const)
    : [];

  return (
    <div>
      {/* メインタブ */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg w-fit mb-12">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSelectedRepo(null);
            }}
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
          {/* リポジトリ一覧画面 */}
          {!selectedRepo && (
            <div
              data-testid="contrib-repo-grid"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
            >
              {techStack.map((tech) => {
                const prCount = filterByRepo(
                  contributions.prs,
                  tech.repo,
                ).length;
                const issueCount = filterByRepo(
                  contributions.issues,
                  tech.repo,
                ).length;
                const reviewCount = filterByRepo(
                  contributions.reviews,
                  tech.repo,
                ).length;
                if (prCount + issueCount + reviewCount === 0) return null;
                return (
                  <RepoCard
                    key={tech.repo}
                    name={tech.name}
                    repo={tech.repo}
                    prCount={prCount}
                    issueCount={issueCount}
                    reviewCount={reviewCount}
                    onClick={() => handleRepoSelect(tech)}
                  />
                );
              })}
            </div>
          )}

          {/* リポジトリ詳細画面 */}
          {selectedRepo && (
            <div className="animate-in fade-in duration-300">
              <div className="flex items-center gap-4 mb-8">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  ← Repositories
                </button>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <div className="flex items-center gap-2">
                  <RepoLogo repo={selectedRepo.repo} size={22} />
                  <h2 className="text-xl font-black text-slate-800 dark:text-white italic">
                    {selectedRepo.name}
                  </h2>
                </div>
              </div>

              {/* サブタブ (PRs / Issues / Reviews) */}
              <div
                data-testid="contrib-subtabs"
                className="flex gap-4 mb-8 border-b border-slate-100 dark:border-slate-800"
              >
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

              {(() => {
                const items = filterByRepo(
                  contributions[subTab],
                  selectedRepo.repo,
                );
                if (items.length === 0) {
                  return (
                    <div className="py-20 text-center text-slate-400">
                      No {subTab} found for {selectedRepo.name}.
                    </div>
                  );
                }
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item) => (
                      <ContributionCard
                        key={item.url}
                        title={item.title}
                        url={item.url}
                        repoName={item.repository.name}
                        date={item.createdAt}
                      />
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
