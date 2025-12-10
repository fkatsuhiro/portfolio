import React from 'react';

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
    <aside className={`
      w-full
      h-[66vh] /* 変更1: min-h ではなく h で高さを固定 */
      sticky top-8 
      bg-white dark:bg-gray-900 
      border border-gray-200 dark:border-gray-800 
      shadow-sm 
      p-6 md:p-8 
      flex flex-col /* 変更2: 内部を縦並びのFlexboxにする */
      ${className}
    `}>
      <div className="flex-shrink-0">
        <h2 className="text-1xl font-bold text-gray-500 dark:text-gray-400 mb-6 tracking-wider uppercase">
          {title}
        </h2>
      </div>
      <div className="
        relative 
        border-l-2 border-gray-300 dark:border-gray-700 
        ml-2 
        space-y-6 
        flex-1 
        overflow-y-auto 
        min-h-0
        pr-2 /* スクロールバーが文字に被らないように少し右余白 */
      ">
        {items.map((item) => (
          <div key={item.id} className="pl-6 relative group">
            <span className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-gray-300 group-hover:bg-gray-800 dark:group-hover:bg-gray-200 transition-colors border-2 border-white dark:border-gray-900"></span>
            
            <a 
              href={`#${item.id}`}
              className="block text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium transition-colors"
            >
              {item.label}
            </a>
          </div>
        ))}
      </div>
    </aside>
  );
}
