import type { TimelineItem } from "../components/TimeLine";
import type { Lang } from "./types";

export const historyByLang: Record<Lang, TimelineItem[]> = {
  ja: [
    {
      date: "2017/4 ~ 2020/3",
      title: "三重県立四日市高等学校 普通科",
      description: "三重県立四日市高等学校 普通科に在籍していました。",
    },
    {
      date: "2020/4 ~ 2024/3",
      title: "千葉大学 理学部 物理学科",
      description: "千葉大学 理学部 物理学科に在籍していました。",
    },
    {
      date: "2024/4 ~ 2026/3",
      title: "東京大学大学院 工学系研究科バイオエンジニアリング専攻",
      description:
        "東京大学大学院 工学系研究科 バイオエンジニアリング専攻に在籍していました。",
    },
    {
      id: "fast-retailing",
      date: "2026/3 ~",
      title: "株式会社ファーストリテイリング",
      description: "フロントエンドエンジニアとして開発業務に取り組んでいます。",
    },
  ],
  en: [
    {
      date: "2017/4 ~ 2020/3",
      title: "Mie Prefectural Yokkaichi High School",
      description:
        "Attended Mie Prefectural Yokkaichi High School, General Course.",
    },
    {
      date: "2020/4 ~ 2024/3",
      title: "Chiba University, Department of Physics",
      description:
        "Attended the Department of Physics, Faculty of Science, Chiba University.",
    },
    {
      date: "2024/4 ~ 2026/3",
      title: "The University of Tokyo Graduate School, Dept. of Bioengineering",
      description:
        "Attended the Department of Bioengineering, Graduate School of Engineering, The University of Tokyo.",
    },
    {
      id: "fast-retailing",
      date: "2026/3 ~",
      title: "Fast Retailing Co., Ltd.",
      description: "Working as a frontend engineer on development projects.",
    },
  ],
  ko: [
    {
      date: "2017/4 ~ 2020/3",
      title: "미에 현립 요카이치 고등학교 보통과",
      description: "미에 현립 요카이치 고등학교 보통과에 재학했습니다.",
    },
    {
      date: "2020/4 ~ 2024/3",
      title: "치바 대학 이학부 물리학과",
      description: "치바 대학 이학부 물리학과에 재학했습니다.",
    },
    {
      date: "2024/4 ~ 2026/3",
      title: "도쿄 대학 대학원 공학계 연구과 바이오 엔지니어링 전공",
      description:
        "도쿄 대학 대학원 공학계 연구과 바이오 엔지니어링 전공에 재학했습니다.",
    },
    {
      id: "fast-retailing",
      date: "2026/3 ~",
      title: "주식회사 패스트 리테일링",
      description: "프론트엔드 엔지니어로서 개발 업무에 종사하고 있습니다.",
    },
  ],
};
