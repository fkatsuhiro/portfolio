import { useState, useEffect } from "react";

export interface ContributionDay {
  contributionCount: number;
  date: string;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

interface ContributionGraphProps {
  calendar?: ContributionCalendar | null;
  heading?: string;
  totalLabel?: string;
  noDataLabel?: string;
}

const CELL_SIZE = 12;
const CELL_GAP = 3;
const CELL_STEP = CELL_SIZE + CELL_GAP;

const LIGHT_COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
const DARK_COLORS = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];

function getLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}

export default function ContributionGraph({
  calendar,
  heading = "GitHub Contributions",
  totalLabel = "過去1年間の貢献",
  noDataLabel = "コントリビューションデータを取得できませんでした。",
}: ContributionGraphProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
  const weekCount = calendar?.weeks.length ?? 0;
  const svgWidth = weekCount * CELL_STEP;
  const svgHeight = 7 * CELL_STEP;

  return (
    <section aria-label={heading} className="mt-10">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {heading}
      </h2>

      {!calendar ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {noDataLabel}
        </p>
      ) : (
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {calendar.totalContributions.toLocaleString()}
            </span>{" "}
            {totalLabel}
          </p>

          <div className="overflow-x-auto pb-2">
            <svg
              role="img"
              aria-label={`GitHub contribution graph: ${calendar.totalContributions} contributions`}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              style={{
                width: Math.min(svgWidth, 728),
                height: "auto",
                display: "block",
              }}
            >
              {calendar.weeks.map((week, weekIdx) =>
                week.contributionDays.map((day) => {
                  const dayOfWeek = new Date(day.date + "T00:00:00").getDay();
                  return (
                    <rect
                      key={day.date}
                      x={weekIdx * CELL_STEP}
                      y={dayOfWeek * CELL_STEP}
                      width={CELL_SIZE}
                      height={CELL_SIZE}
                      rx={2}
                      fill={colors[getLevel(day.contributionCount)]}
                    >
                      <title>{`${day.date}: ${day.contributionCount} contributions`}</title>
                    </rect>
                  );
                }),
              )}
            </svg>
          </div>

          <div className="flex items-center gap-1 mt-2 justify-end text-xs text-gray-400 dark:text-gray-500">
            <span>Less</span>
            {colors.map((c, i) => (
              <svg
                key={i}
                width={CELL_SIZE}
                height={CELL_SIZE}
                viewBox={`0 0 ${CELL_SIZE} ${CELL_SIZE}`}
                aria-hidden="true"
              >
                <rect width={CELL_SIZE} height={CELL_SIZE} rx={2} fill={c} />
              </svg>
            ))}
            <span>More</span>
          </div>
        </div>
      )}
    </section>
  );
}
