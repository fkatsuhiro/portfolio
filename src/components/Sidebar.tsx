import React from 'react';

// 型定義
interface SidebarItem {
  id: string;
  label: string;
}

interface SidebarProps {
  title: string;
  items: SidebarItem[];
  className?: string;
}

export default function Sidebar({ title, items, className = '' }: SidebarProps) {
  return (
    <aside className={`w-full md:w-1/3 lg:w-1/4 bg-gray-50 dark:bg-gray-900 py-12 px-8 md:min-h-screen ${className}`}>
      <div className="sticky top-24">
        <h2 className="text-1xl font-bold text-gray-500 dark:text-gray-400 mb-8 tracking-wider uppercase">
          {title}
        </h2>

        {/* タイムライン風リスト */}
        <div className="relative border-l-2 border-gray-300 dark:border-gray-700 ml-2 space-y-6">
          {items.map((item) => (
            <div key={item.id} className="pl-6 relative group">
              {/* 現在位置を示すドット */}
              <span className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-gray-300 group-hover:bg-gray-800 dark:group-hover:bg-gray-200 transition-colors border-2 border-gray-50 dark:border-gray-900"></span>
              
              <a 
                href={`#${item.id}`}
                className="block text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium transition-colors"
              >
                {item.label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
