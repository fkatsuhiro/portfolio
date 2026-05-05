import { en } from './locales/en';
import { ja } from './locales/ja';
import { ko } from './locales/ko';
import type { Lang, UIKey } from './types';

export const languages = {
  en: 'English',
  ja: '日本語',
  ko: '한국어',
};

export const defaultLang = 'ja';

export const ui = {
  en,
  ja,
  ko,
} as const;

export { type Lang, type UIKey };

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: UIKey) {
    return (ui[lang] as any)[key] || (ui[defaultLang] as any)[key];
  };
}
