import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, Maximize2, X } from "lucide-react";

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isModalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isModalOpen]);

  return (
    <section id={id} className="scroll-mt-32 w-full">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
        <div className="flex items-start justify-between mb-2 gap-2">
          <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
            {title}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              aria-label={`${title} をフルスクリーンで表示`}
              className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
              data-testid="slide-expand-btn"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${title} の詳細を開く`}
              className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
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

      {isModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`${title} スライド`}
            onClick={() => setIsModalOpen(false)}
            data-testid="slide-modal"
          >
            <div
              className="relative w-full max-w-5xl aspect-video rounded-xl overflow-hidden bg-black shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="スライドを閉じる"
                className="absolute top-3 right-3 z-10 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/90"
                data-testid="slide-modal-close"
              >
                <X className="h-5 w-5" />
              </button>
              <iframe
                src={slideLink}
                title={title}
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
