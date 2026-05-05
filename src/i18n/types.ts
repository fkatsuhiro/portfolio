import { ja } from "./locales/ja";

export type UIKey = keyof typeof ja;
export type UIContent = Record<UIKey, string>;
export type Lang = "en" | "ja" | "ko";
