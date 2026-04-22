"use client";

import { useState, type FormEvent } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AiSidebarProps = {
  messages: ChatMessage[];
  isSending?: boolean;
  error?: string | null;
  onSend: (message: string) => Promise<void>;
};

export const AiSidebar = ({
  messages,
  isSending = false,
  error = null,
  onSend,
}: AiSidebarProps) => {
  const [draft, setDraft] = useState("");
  const [isOpen, setIsOpen] = useState(false);

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
        <aside className="pointer-events-auto flex h-[min(72vh,720px)] w-[min(calc(100vw-2rem),420px)] flex-col rounded-[32px] border border-[var(--stroke)] bg-white/95 p-5 shadow-[0_24px_60px_rgba(3,33,71,0.18)] backdrop-blur">
          <div className="flex items-start justify-between gap-3 border-b border-[var(--stroke)] pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--gray-text)]">
                AI Sidebar
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-[var(--navy-dark)]">
                Project Copilot
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--gray-text)]">
                Ask for card changes or quick summaries. The AI can create, edit,
                move, and delete cards.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-[var(--stroke)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--navy-dark)] transition hover:border-[var(--primary-blue)] hover:text-[var(--primary-blue)]"
            >
              Close
            </button>
          </div>

          <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[var(--stroke)] bg-[var(--surface)] px-4 py-5 text-sm leading-6 text-[var(--gray-text)]">
                Try: <span className="font-semibold text-[var(--navy-dark)]">Add a backlog card for vendor review.</span>
              </div>
            ) : null}

            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={
                  message.role === "user"
                    ? "ml-8 rounded-[24px] rounded-br-md bg-[var(--secondary-purple)] px-4 py-3 text-sm leading-6 text-white"
                    : "mr-8 rounded-[24px] rounded-bl-md border border-[var(--stroke)] bg-[var(--surface)] px-4 py-3 text-sm leading-6 text-[var(--navy-dark)]"
                }
              >
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70">
                  {message.role === "user" ? "You" : "AI"}
                </p>
                <p>{message.content}</p>
              </div>
            ))}

            {isSending ? (
              <div className="mr-8 rounded-[24px] rounded-bl-md border border-[var(--stroke)] bg-[var(--surface)] px-4 py-3 text-sm leading-6 text-[var(--navy-dark)]">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70">
                  AI
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
                placeholder="Ask the AI to update cards or summarize the board."
                rows={4}
                className="w-full resize-none rounded-3xl border border-[var(--stroke)] bg-[var(--surface)] px-4 py-3 text-sm leading-6 text-[var(--navy-dark)] outline-none transition focus:border-[var(--primary-blue)]"
              />
              <button
                type="submit"
                disabled={isSending || !draft.trim()}
                className="w-full rounded-full bg-[var(--secondary-purple)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:brightness-110 disabled:opacity-60"
              >
                {isSending ? "Thinking" : "Send To AI"}
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
        {isOpen ? "Hide AI Helper" : "AI Helper"}
      </button>
    </div>
  );
};
