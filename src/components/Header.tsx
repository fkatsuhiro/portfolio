import { useState, useEffect, useRef } from "react";
import ThemeToggle from "./ThemeToggle";
import Home from "./../assets/icon.png";

export default function Header() {
  const [isVisible, setIsVisible] = useState(false);
  const basePath = import.meta.env.BASE_URL;
  const ticking = useRef(false);

  useEffect(() => {
    const baseClean = basePath.replace(/\/$/, "");
    const pathClean = window.location.pathname.replace(/\/$/, "");
    const isHome = pathClean === baseClean || pathClean === "";

    if (!isHome) {
      setIsVisible(true);
      return;
    }

    // ヒーローセクションが画面外に出たタイミングで表示
    const hero = document.querySelector("[data-hero]");
    if (hero) {
      const observer = new IntersectionObserver(
        ([entry]) => setIsVisible(!entry.isIntersecting),
        { threshold: 0 },
      );
      observer.observe(hero);
      return () => observer.disconnect();
    }

    // フォールバック: rAF で throttle したスクロール監視
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

  const navLinks = [
    { name: "About", path: "about" },
    { name: "Works", path: "works" },
    { name: "Talks", path: "talks" },
    { name: "Blogs", path: "blogs" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm z-50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
      aria-label="サイトヘッダー"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <a
          href={basePath}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
          aria-label="ホームへ戻る"
        >
          <img
            src={Home.src}
            alt=""
            className="w-8 h-8 rounded-full object-cover"
          />
        </a>
        <div className="flex items-center gap-6">
          <nav aria-label="メインナビゲーション" className="flex gap-4">
            {navLinks.map((link) => (
              <a
                key={link.path}
                href={`${basePath}/${link.path}`}
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
