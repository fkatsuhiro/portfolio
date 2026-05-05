import { ArrowRight } from "lucide-react";

interface PageLinkBlockProps {
  href: string;
  title: string;
  desc1: string;
  desc2: string;
}

export default function PageLinkBlock({
  href,
  title,
  desc1,
  desc2,
}: PageLinkBlockProps) {
  return (
    <a
      href={href}
      className="group block p-8 rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-800"
    >
      <div className="flex items-start justify-between">
        <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          {title}
        </h3>
        <ArrowRight
          size={20}
          className="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300 mt-1 flex-shrink-0"
        />
      </div>
      <p className="text-sm font-medium text-blue-500 dark:text-blue-400 mb-1">
        {desc1}
      </p>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{desc2}</p>
    </a>
  );
}
