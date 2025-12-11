import React, { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import Home from './../assets/icon.png';

export default function Header() {
  const [isVisible, setIsVisible] = useState(false);
  
  // 修正1: ここで定義しないと下のreturn内で使えません
  // Astroの設定で base: '/portfolio' にしている場合、ここは '/portfolio/' になります
  const basePath = import.meta.env.BASE_URL;

  useEffect(() => {
    const path = window.location.pathname;
    
    // 修正2: ホーム判定ロジックを修正
    // パスが '/' または '/portfolio/' または '/portfolio' の場合にホームとみなす
    // 末尾のスラッシュを削除して統一してから比較すると確実です
    const currentPathClean = path.replace(/\/$/, '');
    const basePathClean = basePath.replace(/\/$/, '');
    
    // 現在地がベースパスと同じならホーム
    const isHomePage = currentPathClean === basePathClean || currentPathClean === '';

    if (!isHomePage) {
      setIsVisible(true);
      return; 
    }

    const handleScroll = () => {
      // 300px以上スクロールしたらヘッダーを表示
      setIsVisible(window.scrollY > 300);
    };
    
    // ホームページの場合のみスクロールイベントを追加
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [basePath]); // basePathを依存配列に追加

  const navLinks = [
    // 修正3: basePathと結合するため、先頭のスラッシュを削除しておくと綺麗です
    // 例: basePath + 'about' -> /portfolio/about
    { name: 'About', path: 'about' },
    { name: 'Works', path: 'works' },
    { name: 'Slides', path: 'slides' },
    { name: 'Blogs', path: 'blogs' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* 修正4: ホームアイコンのリンクも basePath にする */}
        <a href={basePath} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
          <img 
            src={Home.src}
            alt="Home" 
            className="w-8 h-8 rounded-full object-cover" 
          />
        </a>
        <div className="flex items-center gap-6">
          <nav className="flex gap-4">
            {navLinks.map((link) => (
              <a
                key={link.path}
                // 修正5: 構文エラーを修正。basePathとpathを結合
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
