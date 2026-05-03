import { useState, useEffect, useRef } from "react";
import ThemeToggle from "./ThemeToggle";
import Home from "./../assets/icon.png";
import type { Lang } from "../i18n/translations";

interface HeaderProps {
  lang?: Lang;
  altLangHref?: string;
}

export default function Header({
  lang = "ja",
  altLangHref = "/",
}: HeaderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const basePath = import.meta.env.BASE_URL;
  const ticking = useRef(false);

  useEffect(() => {
    const baseClean = basePath.replace(/\/$/, "");
    const pathClean = window.location.pathname.replace(/\/$/, "");
    const isHome =
      pathClean === baseClean ||
      pathClean === "" ||
      pathClean === `${baseClean}/en`;

    if (!isHome) {
      setIsVisible(true);
      return;
    }

    const hero = document.querySelector("[data-hero]");
    if (hero) {
      const observer = new IntersectionObserver(
        ([entry]) => setIsVisible(!entry.isIntersecting),
        { threshold: 0 },
      );
      observer.observe(hero);
      return () => observer.disconnect();
    }

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        setIsVisible(window.scrollY > 300);
        ticking.current = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [basePath]);

  const base = basePath.replace(/\/$/, "");
  const prefix = lang === "en" ? `${base}/en` : base;

  const navLinks = [
    { name: "About", path: "about" },
    { name: "Works", path: "works" },
    { name: "Talks", path: "talks" },
    { name: "Blogs", path: "blogs" },
  ];

  const langLabel = lang === "ja" ? "EN" : "JA";
  const langAriaLabel =
    lang === "ja" ? "Switch to English" : "日本語に切り替える";

  return (
    <header
      className={`fixed top-0 left-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm z-50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
      aria-label="サイトヘッダー"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <a
          href={lang === "en" ? `${base}/en` : base || "/"}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
          aria-label="ホームへ戻る"
        >
          <img
            src={Home.src}
            alt=""
            className="w-8 h-8 rounded-full object-cover"
          />
        </a>
        <div className="flex items-center gap-4">
          <nav aria-label="メインナビゲーション" className="flex gap-4">
            {navLinks.map((link) => (
              <a
                key={link.path}
                href={`${prefix}/${link.path}`}
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>
          <a
            href={altLangHref}
            className="text-xs font-semibold px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            aria-label={langAriaLabel}
          >
            {langLabel}
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
