import type { Lang } from "./types";

export interface ChatFaqLink {
  path: string;
  external?: boolean;
}

export interface ChatFaqEntry {
  id: "about" | "skills" | "works" | "talks" | "hobbies" | "contact";
  keywords: string[];
  answer: string;
  link?: ChatFaqLink;
}

export const chatFaqByLang: Record<Lang, ChatFaqEntry[]> = {
  ja: [
    {
      id: "about",
      keywords: ["自己紹介", "プロフィール", "誰", "経歴", "about"],
      answer:
        "Webフロントエンドに興味があるエンジニアです。株式会社ファーストリテイリングでフロントエンドエンジニアとして働いています。",
    },
    {
      id: "skills",
      keywords: ["スキル", "技術", "得意", "スタック", "skill"],
      answer:
        "React, Astro, TypeScriptを中心に開発しています。Astroや複数のOSSにコントリビュートしています。",
    },
    {
      id: "works",
      keywords: [
        "作品",
        "プロダクト",
        "oss",
        "貢献",
        "コントリビュート",
        "work",
      ],
      answer:
        "Astro, Qwik, Yamada UI, Dioxus, Valibotなどへコントリビュートしています。詳しくはWorksページをどうぞ。",
      link: { path: "/works" },
    },
    {
      id: "talks",
      keywords: ["登壇", "発表", "カンファレンス", "talk"],
      answer:
        "TSKaigiやReact Tokyo Fesなどのカンファレンスで登壇しています。詳しくはTalksページをどうぞ。",
      link: { path: "/talks" },
    },
    {
      id: "hobbies",
      keywords: ["趣味", "休日", "好きなこと", "hobby"],
      answer: "コーヒー、テニス、寝ることが趣味です。",
    },
    {
      id: "contact",
      keywords: ["連絡", "コンタクト", "github", "zenn", "sns", "contact"],
      answer: "GitHubからご連絡いただけます。",
      link: { path: "https://github.com/fkatsuhiro", external: true },
    },
  ],
  en: [
    {
      id: "about",
      keywords: ["about", "who are you", "profile", "background", "bio"],
      answer:
        "I'm an engineer interested in web frontend development, working as a frontend engineer at Fast Retailing.",
    },
    {
      id: "skills",
      keywords: ["skill", "tech stack", "technology", "stack"],
      answer:
        "I mainly develop with React, Astro, and TypeScript, and contribute to Astro and several other OSS projects.",
    },
    {
      id: "works",
      keywords: ["works", "project", "oss", "contribution", "contribute"],
      answer:
        "I contribute to Astro, Qwik, Yamada UI, Dioxus, and Valibot. Check out the Works page for more.",
      link: { path: "/works" },
    },
    {
      id: "talks",
      keywords: ["talk", "conference", "presentation", "speak"],
      answer:
        "I've spoken at conferences like TSKaigi and React Tokyo Fes. See the Talks page for details.",
      link: { path: "/talks" },
    },
    {
      id: "hobbies",
      keywords: ["hobby", "hobbies", "free time", "fun"],
      answer: "My hobbies are coffee, tennis, and sleeping.",
    },
    {
      id: "contact",
      keywords: ["contact", "reach", "github", "zenn", "email"],
      answer: "You can reach me on GitHub.",
      link: { path: "https://github.com/fkatsuhiro", external: true },
    },
  ],
  ko: [
    {
      id: "about",
      keywords: ["소개", "프로필", "당신은 누구", "경력", "about"],
      answer:
        "웹 프론트엔드에 관심이 있는 엔지니어입니다. 패스트 리테일링에서 프론트엔드 엔지니어로 일하고 있습니다.",
    },
    {
      id: "skills",
      keywords: ["기술", "스킬", "스택"],
      answer:
        "주로 React, Astro, TypeScript로 개발하며, Astro를 비롯한 여러 OSS 프로젝트에 기여하고 있습니다.",
    },
    {
      id: "works",
      keywords: ["작품", "프로젝트", "oss", "기여"],
      answer:
        "Astro, Qwik, Yamada UI, Dioxus, Valibot 등에 기여하고 있습니다. 자세한 내용은 작품 페이지를 확인해주세요.",
      link: { path: "/works" },
    },
    {
      id: "talks",
      keywords: ["강연", "발표", "컨퍼런스"],
      answer:
        "TSKaigi, React Tokyo Fes 등의 컨퍼런스에서 강연했습니다. 자세한 내용은 강연 페이지를 확인해주세요.",
      link: { path: "/talks" },
    },
    {
      id: "hobbies",
      keywords: ["취미", "여가"],
      answer: "커피, 테니스, 잠자기가 취미입니다.",
    },
    {
      id: "contact",
      keywords: ["연락처", "깃허브", "github", "연락"],
      answer: "GitHub을 통해 연락하실 수 있습니다.",
      link: { path: "https://github.com/fkatsuhiro", external: true },
    },
  ],
};
