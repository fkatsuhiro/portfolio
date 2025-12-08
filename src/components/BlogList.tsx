import React, { useState, useMemo } from 'react';
import Sidebar from './Sidebar';    // サイドバーを読み込む
import BlogCard from './BlogCard';  // カードを読み込む
import { ArrowUpDown } from 'lucide-react';

// データ型の定義
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
  // ソート順の状態管理
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // ソート切り替え
  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  // データの並び替え（メモ化）
  // ここでソートすると、sidebarItems も sortedItems も同じ順序になります
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.time).getTime();
      const dateB = new Date(b.time).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [items, sortOrder]);

  // サイドバー用にデータを整形
  const sidebarItems = sortedItems.map((item) => ({
    id: item.id,
    label: item.sidebarLabel,
  }));

  return (
    // これまでは page.astro に書いていたレイアウト(flex)をここに移動します
    <div className="min-h-screen flex flex-col md:flex-row mt-10">
      
      {/* 左サイドバー: ソート済みのデータを渡す */}
      <Sidebar title="BLOGS" items={sidebarItems} />

      {/* 右メインエリア */}
      <main className="w-full md:w-2/3 lg:w-3/4 py-12 px-6 md:px-16 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* ソートボタン */}
          <div className="flex justify-end">
            <button
              onClick={toggleSort}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowUpDown size={16} />
              {sortOrder === 'desc' ? '新しい順' : '古い順'}
            </button>
          </div>

          {/* カードリスト表示 */}
          <div className="space-y-24">
            {sortedItems.map((slide) => (
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
