import React from 'react';

interface SlideCardProps {
    id: string;
    link: string;
    image?: string;
}

export default function SlideCard({ id, link, image }: SlideCardProps) {
    return (
        <section id={id} className="scroll-mt-32">
                <div className="w-2/3 flex items-center justify-center rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800">
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 relative group">
                        <a href={link} target="_blank" rel="noopener noreferrer" className="w-full h-full block">
                            <img src={image} alt={link} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </a>
                    </div>
                </div>
        </section>
    );
}
