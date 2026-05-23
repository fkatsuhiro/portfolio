import { useState, useMemo } from "react";
import Sidebar from "./Sidebar";
import BlogCard from "./BlogCard";
import { ArrowUpDown } from "lucide-react";
import { useTranslations, type Lang } from "../i18n/ui";
import { useFeatureFlags } from "../lib/remoteConfig";

type BlogSource = "zenn" | "personal";
type SourceFilter = "all" | BlogSource;

interface BlogItem {
  id: string;
  link: string;
  image: string;
  time: string;
  title?: string;
  description?: string;
  sidebarLabel: string;
  source?: BlogSource;
}

interface BlogListProps {
  items: BlogItem[];
  lang?: Lang;
}

export default function BlogList({ items, lang = "ja" }: BlogListProps) {
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const t = useTranslations(lang);
  const { flags } = useFeatureFlags();

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.time).getTime();
      const dateB = new Date(b.time).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [items, sortOrder]);

  const filteredItems = useMemo(() => {
    return sortedItems.filter((item) => {
      if (item.source === "personal" && !flags.showPersonalBlog) return false;
      if (sourceFilter === "all") return true;
      return item.source === sourceFilter;
    });
  }, [sortedItems, sourceFilter, flags.showPersonalBlog]);

  const sourceTabs: { id: SourceFilter; label: string }[] = [
    { id: "all", label: t("blogs.filterAll") },
    { id: "zenn", label: t("blogs.filterZenn") },
    ...(flags.showPersonalBlog
      ? [{ id: "personal" as SourceFilter, label: t("blogs.filterPersonal") }]
      : []),
  ];

  const sidebarItems = filteredItems.map((item) => ({
    id: item.id,
    label: item.sidebarLabel,
  }));

  const sortLabel =
    sortOrder === "desc" ? t("blogs.sortNewest") : t("blogs.sortOldest");

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-950">
      <div className="hidden md:block w-full md:w-1/3 lg:w-1/4 pt-48 pb-10 md:pl-20 pr-4">
        <div className="sticky top-48">
          <Sidebar title="BLOGS" items={sidebarItems} />
        </div>
      </div>

      <main className="flex-1 py-10 px-6">
        <div className="max-w-5xl mx-auto relative">
          <div className="mb-4 flex gap-1 p-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full shadow-sm w-fit">
            {sourceTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSourceFilter(tab.id)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                  sourceFilter === tab.id
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex justify-end mb-6 sticky top-24 z-20 pointer-events-none h-[50px]">
            <button
              onClick={toggleSort}
              className="pointer-events-auto flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={`Sort: ${sortLabel}`}
            >
              <ArrowUpDown size={16} />
              {sortLabel}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredItems.map((slide) => (
              <BlogCard
                key={slide.id}
                id={slide.id}
                link={slide.link}
                image={slide.image}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
