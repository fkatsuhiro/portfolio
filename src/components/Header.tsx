import { useState, useEffect, useRef } from "react";
import ThemeToggle from "./ThemeToggle";
import Home from "./../assets/icon.png";
import { useTranslations, languages, type Lang } from "../i18n/ui";

interface HeaderProps {
  lang?: Lang;
  langHrefs?: Record<Lang, string>;
}

export default function Header({
  lang = "ja",
  langHrefs = { ja: "/", en: "/en", ko: "/ko" },
}: HeaderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const basePath = import.meta.env.BASE_URL;
  const ticking = useRef(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const t = useTranslations(lang);

  useEffect(() => {
    if (!isLangMenuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (!langMenuRef.current?.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLangMenuOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isLangMenuOpen]);

  useEffect(() => {
    const baseClean = basePath.replace(/\/$/, "");
    const pathClean = window.location.pathname.replace(/\/$/, "");
    const isHome =
      pathClean === baseClean ||
      pathClean === "" ||
      pathClean === `${baseClean}/en` ||
      pathClean === `${baseClean}/ko`;

    if (!isHome) {
      setIsVisible(true);
      return;
    }

    const hero = document.querySelector("[data-hero]");
    if (hero) {
      const observer = new IntersectionObserver(([entry]) => setIsVisible(!entry.isIntersecting), {
        threshold: 0,
      });
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
  const prefix = lang === "en" ? `${base}/en` : lang === "ko" ? `${base}/ko` : base;

  const navLinks = [
    { name: t("nav.about"), path: "about" },
    { name: t("nav.works"), path: "works" },
    { name: t("nav.talks"), path: "talks" },
  ];

  const langSelectAria = t("nav.langSelectAria");
  const langOrder: Lang[] = ["ja", "en", "ko"];

  return (
    <header
      className={`fixed top-0 left-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm z-50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
      aria-label={t("nav.siteHeaderAria")}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <a
          href={lang === "en" ? `${base}/en` : lang === "ko" ? `${base}/ko` : base || "/"}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
          aria-label={t("nav.homeAria")}
        >
          <img src={Home.src} alt="" className="w-8 h-8 rounded-full object-cover" />
        </a>
        <div className="flex items-center gap-4">
          <nav aria-label={t("nav.mainNavAria")} className="flex gap-4">
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
          <div className="relative" ref={langMenuRef}>
            <button
              type="button"
              onClick={() => setIsLangMenuOpen((prev) => !prev)}
              className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              aria-label={langSelectAria}
              aria-haspopup="listbox"
              aria-expanded={isLangMenuOpen}
            >
              {languages[lang]}
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                className={`transition-transform ${isLangMenuOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              >
                <path
                  d="M1 3l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {isLangMenuOpen && (
              <ul
                role="listbox"
                aria-label={langSelectAria}
                className="absolute right-0 mt-2 min-w-[8rem] py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg overflow-hidden"
              >
                {langOrder.map((code) => (
                  <li key={code} role="option" aria-selected={code === lang}>
                    <a
                      href={langHrefs[code]}
                      className={`block px-3 py-1.5 text-sm transition-colors ${
                        code === lang
                          ? "font-semibold text-blue-500"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {languages[code]}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
