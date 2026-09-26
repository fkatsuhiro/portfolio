import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations, type Lang } from "../i18n/ui";
import {
  TYPING_ROUNDS,
  computeStats,
  getCharStatuses,
  getRound,
  getRoundOutcome,
  isPromptCleared,
  recordKeystroke,
  type KeystrokeTally,
  type RoundOutcome,
  type TypingDifficulty,
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

const EMPTY_TALLY: KeystrokeTally = { totalTyped: 0, correctChars: 0 };

export default function TypingGame({ lang = "ja" }: TypingGameProps) {
  const t = useTranslations(lang);
  const inputRef = useRef<HTMLInputElement>(null);
  const [difficulty, setDifficulty] = useState<TypingDifficulty>("easy");
  const [promptIndex, setPromptIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [tally, setTally] = useState<KeystrokeTally>(EMPTY_TALLY);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<RoundOutcome>("playing");
  const [finishedElapsedMs, setFinishedElapsedMs] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  const round = useMemo(() => getRound(difficulty), [difficulty]);
  const timeLimitMs = round.timeLimitSec * 1000;
  const currentPrompt = round.prompts[promptIndex] ?? "";
  const statuses = useMemo(
    () => getCharStatuses(currentPrompt, typed),
    [currentPrompt, typed],
  );

  const started = startTime !== null;
  const finished = started && outcome !== "playing";
  const elapsedMs = started ? now - startTime : 0;
  const timeRemainingMs = started
    ? Math.max(0, timeLimitMs - elapsedMs)
    : timeLimitMs;

  // Live countdown tick while the round is in progress.
  useEffect(() => {
    if (!started || finished) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [started, finished]);

  // Time-up check: runs whenever the countdown ticks.
  useEffect(() => {
    if (!started || finished) return;
    if (timeRemainingMs <= 0) {
      setOutcome("timeup");
      setFinishedElapsedMs(timeLimitMs);
    }
  }, [started, finished, timeRemainingMs, timeLimitMs]);

  function resetRound(nextDifficulty: TypingDifficulty = difficulty) {
    setDifficulty(nextDifficulty);
    setPromptIndex(0);
    setTyped("");
    setTally(EMPTY_TALLY);
    setStartTime(null);
    setOutcome("playing");
    setFinishedElapsedMs(0);
  }

  function selectDifficulty(id: TypingDifficulty) {
    resetRound(id);
  }

  function beginRound() {
    setPromptIndex(0);
    setTyped("");
    setTally(EMPTY_TALLY);
    setOutcome("playing");
    setFinishedElapsedMs(0);
    setStartTime(Date.now());
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function handleStartOrReset() {
    if (started) {
      resetRound();
    } else {
      beginRound();
    }
  }

  function handleChange(value: string) {
    if (finished || !started) return;
    setTally((prev) => recordKeystroke(typed, value, currentPrompt, prev));
    setTyped(value);

    if (isPromptCleared(currentPrompt, value)) {
      const nextIndex = promptIndex + 1;
      const nextOutcome = getRoundOutcome(
        nextIndex,
        round.prompts.length,
        timeRemainingMs,
      );
      if (nextOutcome === "win") {
        setOutcome("win");
        setFinishedElapsedMs(startTime === null ? 0 : Date.now() - startTime);
      } else {
        setPromptIndex(nextIndex);
        setTyped("");
      }
    }
  }

  const finalStats = finished
    ? computeStats(tally.correctChars, tally.totalTyped, finishedElapsedMs)
    : null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label={t("game.selectDifficulty")}
          className="flex gap-2"
        >
          {TYPING_ROUNDS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => selectDifficulty(r.id)}
              aria-pressed={difficulty === r.id}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg border transition-colors ${
                difficulty === r.id
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              {t(DIFFICULTY_KEYS[r.id])}
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

      <div className="mb-3 flex items-center justify-between text-sm font-semibold text-gray-500 dark:text-gray-400">
        <span aria-hidden="true">
          {t("game.typing.progress")
            .replace("{current}", String(Math.min(promptIndex + 1, 10)))
            .replace("{total}", String(round.prompts.length))}
        </span>
        <span aria-hidden="true">
          {t("game.typing.timeLeft").replace(
            "{sec}",
            (timeRemainingMs / 1000).toFixed(1),
          )}
        </span>
      </div>

      <p
        className="mb-6 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-4 text-2xl sm:text-3xl font-mono leading-relaxed text-center whitespace-pre-wrap break-words"
        aria-hidden="true"
      >
        {currentPrompt.split("").map((ch, i) => {
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
        disabled={!started || finished}
        maxLength={currentPrompt.length}
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
        className={`mt-6 text-center text-lg font-bold h-7 ${
          outcome === "timeup"
            ? "text-amber-600 dark:text-amber-400"
            : "text-emerald-600 dark:text-emerald-400"
        }`}
      >
        {finished && finalStats && outcome === "win"
          ? t("game.typing.result")
              .replace("{wpm}", String(finalStats.wpm))
              .replace("{accuracy}", String(finalStats.accuracy))
          : finished && outcome === "timeup"
            ? t("game.typing.timeUp")
                .replace("{completed}", String(promptIndex))
                .replace("{total}", String(round.prompts.length))
            : ""}
      </p>
    </div>
  );
}
