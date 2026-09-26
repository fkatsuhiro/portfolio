import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations, type Lang } from "../i18n/ui";
import {
  TYPING_PROMPTS,
  computeStats,
  getCharStatuses,
  getPrompt,
  isComplete,
  type TypingDifficulty,
  type TypingStats,
} from "../lib/typing";

interface TypingGameProps {
  lang?: Lang;
}

const DIFFICULTY_KEYS: Record<
  TypingDifficulty,
  "game.difficulty.easy" | "game.difficulty.medium" | "game.difficulty.hard"
> = {
  easy: "game.difficulty.easy",
  medium: "game.difficulty.medium",
  hard: "game.difficulty.hard",
};

export default function TypingGame({ lang = "ja" }: TypingGameProps) {
  const t = useTranslations(lang);
  const inputRef = useRef<HTMLInputElement>(null);
  const [difficulty, setDifficulty] = useState<TypingDifficulty>("easy");
  const [typed, setTyped] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<TypingStats | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const prompt = useMemo(() => getPrompt(difficulty), [difficulty]);
  const statuses = useMemo(
    () => getCharStatuses(prompt.text, typed),
    [prompt, typed],
  );

  useEffect(() => {
    if (startTime === null || finished) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [startTime, finished]);

  const elapsedMs = startTime === null ? 0 : now - startTime;
  const started = startTime !== null || typed.length > 0;

  function resetRound(nextDifficulty: TypingDifficulty = difficulty) {
    setDifficulty(nextDifficulty);
    setTyped("");
    setStartTime(null);
    setFinished(false);
    setFinalStats(null);
    inputRef.current?.focus();
  }

  function selectPuzzle(id: TypingDifficulty) {
    resetRound(id);
  }

  function handleStartOrReset() {
    if (started) {
      resetRound();
    } else {
      inputRef.current?.focus();
    }
  }

  function handleChange(value: string) {
    if (finished) return;
    let nextStart = startTime;
    if (nextStart === null && value.length > 0) {
      nextStart = Date.now();
      setStartTime(nextStart);
    }
    setTyped(value);
    if (isComplete(prompt.text, value)) {
      const elapsed = nextStart === null ? 0 : Date.now() - nextStart;
      setFinished(true);
      setFinalStats(computeStats(prompt.text, value, elapsed));
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label={t("game.selectDifficulty")}
          className="flex gap-2"
        >
          {TYPING_PROMPTS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectPuzzle(p.id)}
              aria-pressed={difficulty === p.id}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg border transition-colors ${
                difficulty === p.id
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              {t(DIFFICULTY_KEYS[p.id])}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleStartOrReset}
          className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {started ? t("game.reset") : t("game.typing.start")}
        </button>
      </div>

      <p
        aria-hidden="true"
        className="mb-3 text-center text-sm font-semibold text-gray-500 dark:text-gray-400"
      >
        {t("game.typing.elapsed").replace("{sec}", (elapsedMs / 1000).toFixed(1))}
      </p>

      <p
        className="mb-6 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-4 text-lg sm:text-xl font-mono leading-relaxed whitespace-pre-wrap break-words"
        aria-hidden="true"
      >
        {prompt.text.split("").map((ch, i) => {
          const status = statuses[i];
          const isCursor = i === typed.length && !finished;
          return (
            <span
              key={i}
              className={[
                status === "correct"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : status === "incorrect"
                    ? "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400"
                    : "text-gray-400 dark:text-gray-600",
                isCursor
                  ? "bg-blue-100 dark:bg-blue-900/50 rounded-sm outline outline-2 outline-blue-500"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {ch}
            </span>
          );
        })}
      </p>

      <input
        ref={inputRef}
        type="text"
        value={typed}
        onChange={(e) => handleChange(e.target.value)}
        disabled={finished}
        maxLength={prompt.text.length}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label={t("game.typing.inputAria")}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-3 text-base font-mono text-gray-800 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
      />

      <p
        role="status"
        aria-live="polite"
        className="mt-6 text-center text-lg font-bold text-emerald-600 dark:text-emerald-400 h-7"
      >
        {finished && finalStats
          ? t("game.typing.result")
              .replace("{wpm}", String(finalStats.wpm))
              .replace("{accuracy}", String(finalStats.accuracy))
          : ""}
      </p>
    </div>
  );
}
