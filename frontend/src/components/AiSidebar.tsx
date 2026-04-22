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
    <aside className="flex h-full min-h-[720px] flex-col rounded-[32px] border border-[var(--stroke)] bg-white/90 p-5 shadow-[var(--shadow)] backdrop-blur">
      <div className="border-b border-[var(--stroke)] pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--gray-text)]">
          AI Sidebar
        </p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-[var(--navy-dark)]">
          Project Copilot
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--gray-text)]">
          Ask for card changes or quick summaries. The AI can create, edit, move,
          and delete cards.
        </p>
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
            {isSending ? "Sending" : "Send To AI"}
          </button>
        </form>
      </div>
    </aside>
  );
};
