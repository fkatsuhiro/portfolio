import React from 'react';
import { ExternalLink } from 'lucide-react';

interface SlideCardProps {
    id: string;
    title: string;
    link: string;
    time?: string;
    description: string;
    speakerDec: string;
    image?: string;
}

export default function SlideCard({ id, title, link, time, description, speakerDec, image }: SlideCardProps) {
    return (
        <section id={id} className="scroll-mt-32">
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 md:p-12 shadow-sm hover:shadow-md transition-shadow">

                <div className="flex items-start justify-between mb-6">
                    <h3 className="text-1xl md:text-2xl font-bold text-gray-900 dark:text-white">
                        {title}
                    </h3>
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <ExternalLink className="w-6 h-6" />
                    </a>
                </div>

                {time && (
                    <div className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                        {time}
                    </div>
                )}

                <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed font-medium">
                    {description}
                </p>

                <div className="w-2/3 flex items-center justify-center rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800">
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 relative group">
                        <a href={speakerDec} target="_blank" rel="noopener noreferrer" className="w-full h-full block">
                            <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
