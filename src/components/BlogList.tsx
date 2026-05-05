import { useState, useMemo } from "react";
import Sidebar from "./Sidebar";
import BlogCard from "./BlogCard";
import { ArrowUpDown } from "lucide-react";

interface BlogItem {
  id: string;
  link: string;
  image: string;
  time: string;
  title?: string;
  description?: string;
  sidebarLabel: string;
}

interface BlogListProps {
  items: BlogItem[];
}

export default function BlogList({ items }: BlogListProps) {
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

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

  const sidebarItems = sortedItems.map((item) => ({
    id: item.id,
    label: item.sidebarLabel,
  }));

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-950">
      <div className="hidden md:block w-full md:w-1/3 lg:w-1/4 pt-48 pb-10 md:pl-20 pr-4">
        <div className="sticky top-48">
          <Sidebar title="BLOGS" items={sidebarItems} />
        </div>
      </div>

      <main className="flex-1 py-10 px-6">
        <div className="max-w-5xl mx-auto relative">
          <div className="hidden md:flex justify-end mb-6 sticky top-24 z-20 pointer-events-none h-[50px]">
            <button
              onClick={toggleSort}
              className="pointer-events-auto flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={`並び替え: 現在${sortOrder === "desc" ? "新しい順" : "古い順"}`}
            >
              <ArrowUpDown size={16} />
              {sortOrder === "desc" ? "新しい順" : "古い順"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {sortedItems.map((slide) => (
              <BlogCard key={slide.id} id={slide.id} link={slide.link} image={slide.image} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
