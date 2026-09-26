import { useState } from "react";
import { useTranslations, type Lang, type UIKey } from "../i18n/ui";
import Sudoku from "./Sudoku";
import Shikaku from "./Shikaku";
import TypingGame from "./TypingGame";

interface GameHubProps {
  lang?: Lang;
}

type GameId = "sudoku" | "shikaku" | "typing";

interface GameOption {
  id: GameId;
  headingKey: UIKey;
  subheadingKey: UIKey;
  descKey: UIKey;
}

const GAMES: GameOption[] = [
  {
    id: "sudoku",
    headingKey: "game.heading",
    subheadingKey: "game.subheading",
    descKey: "game.hub.sudokuDesc",
  },
  {
    id: "shikaku",
    headingKey: "game.shikaku.heading",
    subheadingKey: "game.shikaku.subheading",
    descKey: "game.hub.shikakuDesc",
  },
  {
    id: "typing",
    headingKey: "game.typing.heading",
    subheadingKey: "game.typing.subheading",
    descKey: "game.hub.typingDesc",
  },
];

export default function GameHub({ lang = "ja" }: GameHubProps) {
  const t = useTranslations(lang);
  const [active, setActive] = useState<GameId | null>(null);

  if (!active) {
    return (
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">
          {t("game.hub.heading")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-10">
          {t("game.hub.subheading")}
        </p>
        <div
          role="group"
          aria-label={t("game.hub.heading")}
          className="grid gap-4 sm:grid-cols-3"
        >
          {GAMES.map((game) => (
            <button
              key={game.id}
              type="button"
              onClick={() => setActive(game.id)}
              aria-label={t(game.headingKey)}
              className="flex flex-col items-center gap-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-6 text-center shadow-sm hover:border-blue-500 hover:shadow-md transition-colors"
            >
              <span className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {t(game.headingKey)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t(game.descKey)}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const activeGame = GAMES.find((g) => g.id === active)!;

  return (
    <div>
      <div className="max-w-2xl mx-auto mb-6">
        <button
          type="button"
          onClick={() => setActive(null)}
          className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← {t("game.hub.back")}
        </button>
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2">
          {t(activeGame.headingKey)}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          {t(activeGame.subheadingKey)}
        </p>
      </div>

      {active === "sudoku" && <Sudoku lang={lang} />}
      {active === "shikaku" && <Shikaku lang={lang} />}
      {active === "typing" && <TypingGame lang={lang} />}
    </div>
  );
}
