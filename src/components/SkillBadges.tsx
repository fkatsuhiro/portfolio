import { useTranslations, type Lang, type UIKey } from "../i18n/ui";

interface SkillBadgesProps {
  lang?: Lang;
  heading?: string;
}

const CATEGORIES: {
  labelKey: UIKey;
  badgeClass: string;
  skills: string[];
}[] = [
  {
    labelKey: "about.skills.frameworks",
    badgeClass:
      "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
    skills: ["React", "Astro", "Qwik"],
  },
  {
    labelKey: "about.skills.languages",
    badgeClass:
      "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800",
    skills: ["TypeScript", "JavaScript", "Python", "Rust"],
  },
  {
    labelKey: "about.skills.tools",
    badgeKey: "about.skills.tools",
    badgeClass:
      "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
    skills: ["TailwindCSS", "Vite", "GitHub Actions", "Playwright", "pnpm"],
  },
] as any; // Temporary cast to avoid type errors with labelKey if not perfect

export default function SkillBadges({ lang = "ja", heading = "Tech Stack" }: SkillBadgesProps) {
  const t = useTranslations(lang);

  return (
    <section aria-label={heading} className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{heading}</h2>
      <div className="flex flex-col gap-6">
        {CATEGORIES.map((cat) => {
          const label = t(cat.labelKey);
          return (
            <div key={cat.labelKey}>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                {label}
              </h3>
              <div className="flex flex-wrap gap-2" role="list" aria-label={label}>
                {cat.skills.map((skill) => (
                  <span
                    key={skill}
                    role="listitem"
                    className={`px-3 py-1 rounded-full text-sm font-medium ${cat.badgeClass}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
