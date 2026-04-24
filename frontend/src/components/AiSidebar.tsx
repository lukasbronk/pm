"use client";

import { useState, type FormEvent } from "react";
import type { ViewMode } from "@/lib/kanban";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AiSidebarProps = {
  messages: ChatMessage[];
  isSending?: boolean;
  error?: string | null;
  onSend: (message: string) => Promise<void>;
  viewMode?: ViewMode;
};

export const AiSidebar = ({
  messages,
  isSending = false,
  error = null,
  onSend,
  viewMode = "classic",
}: AiSidebarProps) => {
  const [draft, setDraft] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const isArcadeMode = viewMode === "arcade";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message || isSending) {
      return;
    }

    setDraft("");
    await onSend(message);
  };

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {isOpen ? (
        <aside className="pointer-events-auto flex h-[min(72vh,720px)] w-[min(calc(100vw-2rem),420px)] flex-col rounded-[32px] border border-[var(--stroke)] bg-[var(--sidebar-bg)] p-5 shadow-[0_24px_60px_rgba(3,33,71,0.18)] backdrop-blur">
          <div className="flex items-start justify-between gap-3 border-b border-[var(--stroke)] pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--sidebar-muted)]">
                {isArcadeMode ? "Arcade Advisor" : "AI Sidebar"}
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-[var(--sidebar-text)]">
                {isArcadeMode ? "Game Master" : "Project Copilot"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--sidebar-muted)]">
                {isArcadeMode
                  ? "Ask for the best next play, rebalance the run, or reshape the board in one move."
                  : "Ask for card changes or quick summaries. The AI can create, edit, move, and delete cards."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-[var(--stroke)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--sidebar-text)] transition hover:border-[var(--primary-blue)] hover:text-[var(--primary-blue)]"
            >
              Close
            </button>
          </div>

          <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[var(--stroke)] bg-[var(--sidebar-panel)] px-4 py-5 text-sm leading-6 text-[var(--sidebar-muted)]">
                Try:{" "}
                <span className="font-semibold text-[var(--sidebar-text)]">
                  {isArcadeMode
                    ? "Build me a balanced next hand from this board."
                    : "Add a backlog card for vendor review."}
                </span>
              </div>
            ) : null}

            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={
                  message.role === "user"
                    ? "ml-8 rounded-[24px] rounded-br-md bg-[var(--sidebar-user-bg)] px-4 py-3 text-sm leading-6 text-white"
                    : "mr-8 rounded-[24px] rounded-bl-md border border-[var(--stroke)] bg-[var(--sidebar-assistant-bg)] px-4 py-3 text-sm leading-6 text-[var(--sidebar-text)]"
                }
              >
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70">
                  {message.role === "user" ? "You" : isArcadeMode ? "Game Master" : "AI"}
                </p>
                <p>{message.content}</p>
              </div>
            ))}

            {isSending ? (
              <div className="mr-8 rounded-[24px] rounded-bl-md border border-[var(--stroke)] bg-[var(--sidebar-assistant-bg)] px-4 py-3 text-sm leading-6 text-[var(--sidebar-text)]">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70">
                  {isArcadeMode ? "Game Master" : "AI"}
                </p>
                <p className="flex items-center gap-2">
                  <span className="inline-flex gap-1" aria-hidden="true">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--primary-blue)] [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--primary-blue)] [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--primary-blue)] [animation-delay:300ms]" />
                  </span>
                  Thinking...
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-4 border-t border-[var(--stroke)] pt-4">
            {error ? (
              <p className="mb-3 text-sm font-medium text-[var(--secondary-purple)]">{error}</p>
            ) : null}
            <form className="space-y-3" onSubmit={handleSubmit}>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={
                  isArcadeMode
                    ? "Ask the Game Master for the best next play."
                    : "Ask the AI to update cards or summarize the board."
                }
                rows={4}
                className="w-full resize-none rounded-3xl border border-[var(--stroke)] bg-[var(--sidebar-panel)] px-4 py-3 text-sm leading-6 text-[var(--sidebar-text)] outline-none transition placeholder:text-[var(--sidebar-muted)] focus:border-[var(--primary-blue)]"
              />
              <button
                type="submit"
                disabled={isSending || !draft.trim()}
                className="w-full rounded-full bg-[var(--secondary-purple)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:brightness-110 disabled:opacity-60"
              >
                {isSending ? "Thinking" : isArcadeMode ? "Consult Game Master" : "Send To AI"}
              </button>
            </form>
          </div>
        </aside>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="pointer-events-auto rounded-full bg-[var(--secondary-purple)] px-5 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_18px_40px_rgba(117,57,145,0.35)] transition hover:brightness-110"
      >
        {isOpen
          ? isArcadeMode
            ? "Hide Game Master"
            : "Hide AI Helper"
          : isArcadeMode
            ? "Game Master"
            : "AI Helper"}
      </button>
    </div>
  );
};
