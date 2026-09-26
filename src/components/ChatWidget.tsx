import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { useTranslations, type Lang } from "../i18n/ui";
import { chatFaqByLang, type ChatFaqEntry } from "../i18n/chatFaq";
import { findFaqMatch } from "../lib/chat";

interface ChatWidgetProps {
  lang?: Lang;
}

interface ChatMessage {
  role: "bot" | "user";
  text: string;
  link?: { href: string; label: string };
}

export default function ChatWidget({ lang = "ja" }: ChatWidgetProps) {
  const t = useTranslations(lang);
  const faqEntries = chatFaqByLang[lang];
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const prefix =
    lang === "en"
      ? `${basePath}/en`
      : lang === "ko"
        ? `${basePath}/ko`
        : basePath;

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: t("chat.greeting") },
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  function resolveLink(
    entry: ChatFaqEntry,
  ): { href: string; label: string } | undefined {
    if (!entry.link) return undefined;
    if (entry.link.external) {
      return {
        href: entry.link.path,
        label: entry.link.path.replace(/^https?:\/\//, ""),
      };
    }
    const navKey =
      entry.id === "works"
        ? "nav.works"
        : entry.id === "talks"
          ? "nav.talks"
          : "nav.about";
    return { href: `${prefix}${entry.link.path}`, label: t(navKey) };
  }

  function respondWith(entry: ChatFaqEntry) {
    setMessages((prev) => [
      ...prev,
      { role: "bot", text: entry.answer, link: resolveLink(entry) },
    ]);
  }

  function handleTagClick(entry: ChatFaqEntry) {
    const tagKey = `chat.tag.${entry.id}` as const;
    setMessages((prev) => [...prev, { role: "user", text: t(tagKey) }]);
    respondWith(entry);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const query = inputValue.trim();
    if (!query) return;

    setMessages((prev) => [...prev, { role: "user", text: query }]);
    const match = findFaqMatch(faqEntries, query);
    if (match) {
      respondWith(match);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: t("chat.fallback") },
      ]);
    }
    setInputValue("");
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div
          role="dialog"
          aria-label={t("chat.title")}
          className="absolute bottom-20 right-0 w-80 max-w-[calc(100vw-3rem)] h-[28rem] max-h-[70vh] flex flex-col rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <span className="font-bold text-gray-900 dark:text-white">
              {t("chat.title")}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={t("chat.closeLabel")}
              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div
            role="log"
            aria-live="polite"
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          >
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  }`}
                >
                  <p>{message.text}</p>
                  {message.link && (
                    <a
                      href={message.link.href}
                      target={
                        message.link.href.startsWith("http")
                          ? "_blank"
                          : undefined
                      }
                      rel={
                        message.link.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="mt-1 inline-block text-xs font-semibold underline text-blue-600 dark:text-blue-300"
                    >
                      {message.link.label} →
                    </a>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-1.5">
            {faqEntries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => handleTagClick(entry)}
                className="px-2 py-1 text-xs font-semibold rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {t(`chat.tag.${entry.id}` as const)}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 dark:border-gray-800"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t("chat.inputPlaceholder")}
              aria-label={t("chat.inputAria")}
              className="flex-1 min-w-0 px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              aria-label={t("chat.send")}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? t("chat.closeLabel") : t("chat.widgetLabel")}
        aria-expanded={isOpen}
        className="w-16 h-16 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center transition-colors text-3xl leading-none"
      >
        {isOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <span aria-hidden="true">👋</span>
        )}
      </button>
    </div>
  );
}
