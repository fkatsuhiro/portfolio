import React, { useEffect, useState, useMemo } from 'react';
import Sidebar from './Sidebar';    // サイドバーを読み込む
import BlogCard from './BlogCard';  // カードを読み込む
import { ArrowUpDown } from 'lucide-react';

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
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [isPcWidth, setIsPcWidth] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsPcWidth(window.innerWidth > 667);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSort = () => {
        setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    };

    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            const dateA = new Date(a.time).getTime();
            const dateB = new Date(b.time).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
    }, [items, sortOrder]);

    const sidebarItems = sortedItems.map((item) => ({
        id: item.id,
        label: item.sidebarLabel,
    }));

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-950">
            {isPcWidth && (<div className="w-full md:w-1/3 lg:w-1/4 p-6 md:p-8 top-20 mb-10 mx-10">
                <div className="sticky top-24">
                    <Sidebar title="BLOGS" items={sidebarItems} />
                </div>
            </div>)}

            <main className="w-full md:w-2/3 lg:w-3/4 py-10 px-6">
                <div className="max-w-3xl mx-auto space-y-8 flex">
                    <div className="space-y-12 md:w-2/3">
                        {sortedItems.map((slide) => (
                            <BlogCard
                                key={slide.id}
                                id={slide.id}
                                link={slide.link}
                                image={slide.image}
                            />
                        ))}
                    </div>

                    {isPcWidth && (
                        <div className="flex justify-end pt-4 sticky top-24 z-10 pointer-events-none md:w-1/3 h-[60px]">
                            <button
                                onClick={toggleSort}
                                className="
                                pointer-events-auto 
                                flex items-center gap-2 px-4 py-2 
                                text-sm font-medium 
                                text-gray-600 dark:text-gray-300 
                                bg-white dark:bg-gray-900 
                                border border-gray-200 dark:border-gray-800
                                rounded-full 
                                shadow-md 
                                hover:bg-gray-100 dark:hover:bg-gray-800 
                                transition-colors
                            "
                            >
                                <ArrowUpDown size={16} />
                                {sortOrder === 'desc' ? '新しい順' : '古い順'}
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
