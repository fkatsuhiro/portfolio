import { ExternalLink } from "lucide-react";

interface BlogCardProps {
  title: string;
  description: string;
  image: string | null;
  url: string;
  // e.g. "Read {title} on Zenn" — {title} is substituted here so callers can
  // pass a translated template without threading string interpolation through props.
  ariaLabelTemplate: string;
}

export default function BlogCard({
  title,
  description,
  image,
  url,
  ariaLabelTemplate,
}: BlogCardProps) {
  const ariaLabel = ariaLabelTemplate.replace("{title}", title);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="group block bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all h-full flex flex-col"
    >
      <div className="w-full aspect-video bg-gray-50 dark:bg-black/20 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={`Cover image for ${title}`}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700 text-xs">
            {title}
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="text-sm md:text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
            {title}
          </h2>
          <ExternalLink className="w-4 h-4 flex-shrink-0 mt-1 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-normal line-clamp-3 flex-grow">
          {description}
        </p>
      </div>
    </a>
  );
}
