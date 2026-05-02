export const translations = {
  ja: {
    meta: {
      home: {
        title: 'Portfolio',
        description: 'Furuichi Katsuhiro — Frontend Developer. OSS contributor to Astro, Qwik, Yamada UI and more.',
      },
      about: {
        title: 'About',
        description: 'Furuichi Katsuhiro — Frontend Developer at Fast Retailing. Graduate of Tokyo University. Loves React, Astro, Qwik, and TypeScript.',
      },
      works: {
        title: 'Works',
        description: 'Products and OSS contributions by Furuichi Katsuhiro. Contributor to Astro, Qwik, Yamada UI, Dioxus, and Valibot.',
      },
      talks: {
        title: 'Talks',
        description: 'Talks and presentations by Furuichi Katsuhiro at tech conferences including TSKaigi and React Tokyo Fes.',
      },
      blogs: {
        title: 'Blogs',
        description: 'Technical articles and notes by Furuichi Katsuhiro about frontend development, TypeScript, and web technologies.',
      },
    },
    home: {
      role: 'Frontend Developer',
      scrollDown: 'Scroll Down',
      menu: {
        about: { title: 'About', desc1: 'Who am I.', desc2: 'My story, skills, and where to find me.' },
        works: { title: 'Works', desc1: 'Development Lab.', desc2: 'Products I build. A collection of tools and ideas.' },
        talks: { title: 'Talks', desc1: 'Talks', desc2: 'Sharing slides at tech conference and events.' },
        blogs: { title: 'Blogs', desc1: 'Writing.', desc2: 'Articles, notes, and technical dives.' },
      },
    },
    about: {
      bio: 'Webフロントエンドに興味があります。',
      techSentence: '普段は React, Astro, Qwik, TypeScript を用いた開発を行なっています。特にQwikが好きです。',
      hobbies: '趣味：コーヒー、テニス、寝ること',
      skills: { heading: 'Tech Stack' },
      contributions: {
        heading: 'GitHub Contributions',
        totalLabel: '過去1年間の貢献',
        noData: 'コントリビューションデータを取得できませんでした。',
      },
      history: [
        {
          date: '2017/4 ~ 2020/3',
          title: '三重県立四日市高等学校 普通科',
          description: '三重県立四日市高等学校 普通科に在籍していました。',
        },
        {
          date: '2020/4 ~ 2024/3',
          title: '千葉大学 理学部 物理学科',
          description: '千葉大学 理学部 物理学科に在籍していました。',
        },
        {
          date: '2024/4 ~ 2026/3',
          title: '東京大学大学院 工学系研究科バイオエンジニアリング専攻',
          description: '東京大学大学院 工学系研究科 バイオエンジニアリング専攻に在籍していました。',
        },
        {
          date: '2026/3 ~',
          title: '株式会社ファーストリテイリング',
          description: 'フロントエンドエンジニアとして開発業務に取り組んでいます。',
        },
      ],
    },
    works: { heading: 'Works', subheading: 'My products and contributions.' },
    talks: { heading: 'Talks' },
    blogs: { sortNewest: '新しい順', sortOldest: '古い順' },
    nav: {
      langToggle: 'EN',
      toggleAriaLabel: 'Switch to English',
    },
  },
  en: {
    meta: {
      home: {
        title: 'Portfolio',
        description: 'Furuichi Katsuhiro — Frontend Developer. OSS contributor to Astro, Qwik, Yamada UI and more.',
      },
      about: {
        title: 'About',
        description: 'Furuichi Katsuhiro — Frontend Developer at Fast Retailing. Graduate of Tokyo University. Loves React, Astro, Qwik, and TypeScript.',
      },
      works: {
        title: 'Works',
        description: 'Products and OSS contributions by Furuichi Katsuhiro. Contributor to Astro, Qwik, Yamada UI, Dioxus, and Valibot.',
      },
      talks: {
        title: 'Talks',
        description: 'Talks and presentations by Furuichi Katsuhiro at tech conferences including TSKaigi and React Tokyo Fes.',
      },
      blogs: {
        title: 'Blogs',
        description: 'Technical articles and notes by Furuichi Katsuhiro about frontend development, TypeScript, and web technologies.',
      },
    },
    home: {
      role: 'Frontend Developer',
      scrollDown: 'Scroll Down',
      menu: {
        about: { title: 'About', desc1: 'Who am I.', desc2: 'My story, skills, and where to find me.' },
        works: { title: 'Works', desc1: 'Development Lab.', desc2: 'Products I build. A collection of tools and ideas.' },
        talks: { title: 'Talks', desc1: 'Talks', desc2: 'Sharing slides at tech conference and events.' },
        blogs: { title: 'Blogs', desc1: 'Writing.', desc2: 'Articles, notes, and technical dives.' },
      },
    },
    about: {
      bio: "I'm interested in web frontend development.",
      techSentence: 'I mainly develop with React, Astro, Qwik, and TypeScript. Especially love Qwik.',
      hobbies: 'Hobbies: Coffee, Tennis, Sleeping',
      skills: { heading: 'Tech Stack' },
      contributions: {
        heading: 'GitHub Contributions',
        totalLabel: 'contributions in the last year',
        noData: 'Could not load contribution data.',
      },
      history: [
        {
          date: '2017/4 ~ 2020/3',
          title: 'Mie Prefectural Yokkaichi High School',
          description: 'Attended Mie Prefectural Yokkaichi High School, General Course.',
        },
        {
          date: '2020/4 ~ 2024/3',
          title: 'Chiba University, Department of Physics',
          description: 'Attended the Department of Physics, Faculty of Science, Chiba University.',
        },
        {
          date: '2024/4 ~ 2026/3',
          title: 'The University of Tokyo Graduate School, Dept. of Bioengineering',
          description: 'Attended the Department of Bioengineering, Graduate School of Engineering, The University of Tokyo.',
        },
        {
          date: '2026/3 ~',
          title: 'Fast Retailing Co., Ltd.',
          description: 'Working as a frontend engineer on development projects.',
        },
      ],
    },
    works: { heading: 'Works', subheading: 'My products and contributions.' },
    talks: { heading: 'Talks' },
    blogs: { sortNewest: 'Newest', sortOldest: 'Oldest' },
    nav: {
      langToggle: 'JA',
      toggleAriaLabel: '日本語に切り替える',
    },
  },
} as const;

export type Lang = keyof typeof translations;
