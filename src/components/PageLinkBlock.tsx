interface PageLinkBlockProps {
    href: string;
    title: string;
    desc1: string;
    desc2: string;
}

export default function PageLinkBlock({ href, title, desc1, desc2 }: PageLinkBlockProps) {
    return (
        <a
            href={href}
            className="group block p-8 rounded-2xl bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100 dark:border-gray-800 item-center"
        >
            <h3 className="text-2xl font-bold mb-2 transition-colors mt-5 ">
                {title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-1">
                {desc1}
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-5">
                {desc2}
            </p>
        </a>
    );
}
