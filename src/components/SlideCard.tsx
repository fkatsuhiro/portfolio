import { ExternalLink } from "lucide-react";

interface SlideCardProps {
  id: string;
  title: string;
  link: string;
  time?: string;
  description: string;
  slideLink: string;
  image?: string;
}

export default function SlideCard({
  id,
  title,
  link,
  time,
  description,
  slideLink,
}: SlideCardProps) {
  return (
    <section id={id} className="scroll-mt-32 w-full">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
        <div className="flex items-start justify-between mb-2 gap-2">
          <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
            {title}
          </h3>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${title} の詳細を開く`}
            className="p-1 text-gray-400 hover:text-blue-500 flex-shrink-0 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {time && (
          <div className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-2">
            {time}
          </div>
        )}

        <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 leading-normal line-clamp-2 flex-grow">
          {description}
        </p>

        <div className="px-0 md:px-4 mt-auto">
          <div className="w-full aspect-video rounded-lg overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-black/20">
            <iframe
              src={slideLink}
              title={title}
              allowFullScreen
              className="w-full h-full border-0"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
