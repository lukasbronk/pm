"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AiSidebar } from "@/components/AiSidebar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { initialData, normalizeBoardData, type BoardData } from "@/lib/kanban";

type SessionState = {
  authenticated: boolean;
  username: string | null;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const initialSessionState: SessionState = {
  authenticated: false,
  username: null,
};

export const AppShell = () => {
  const [session, setSession] = useState<SessionState | null>(null);
  const [board, setBoard] = useState<BoardData | null>(null);
  const [formState, setFormState] = useState({ username: "user", password: "password" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBoard, setIsLoadingBoard] = useState(false);
  const [isSavingBoard, setIsSavingBoard] = useState(false);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isSendingAi, setIsSendingAi] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      const response = await fetch("/api/auth/session", {
        credentials: "same-origin",
      });
      const nextSession = (await response.json()) as SessionState;
      setSession(nextSession);
    };

    void loadSession();
  }, []);

  useEffect(() => {
    if (!session?.authenticated) {
      setBoard(null);
      setMessages([]);
      return;
    }

    const loadBoard = async () => {
      setIsLoadingBoard(true);
      setBoardError(null);

      try {
        const response = await fetch("/api/board", {
          credentials: "same-origin",
        });

        if (!response.ok) {
          setBoard(initialData);
          setBoardError("Could not load the saved board.");
          return;
        }

        const nextBoard = normalizeBoardData((await response.json()) as BoardData);
        setBoard(nextBoard);
      } finally {
        setIsLoadingBoard(false);
      }
    };

    void loadBoard();
  }, [session]);

  useEffect(() => {
    if (!session?.authenticated) {
      return;
    }

    const loadHistory = async () => {
      try {
        const response = await fetch("/api/ai/history", {
          credentials: "same-origin",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { messages?: ChatMessage[] };
        if (Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      } catch {
        setMessages([]);
      }
    };

    void loadHistory();
  }, [session]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        setError("Use user / password to sign in.");
        return;
      }

      const nextSession = (await response.json()) as SessionState;
      setSession(nextSession);
      setBoardError(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    setSession(initialSessionState);
    setBoard(null);
    setBoardError(null);
    setMessages([]);
    setAiError(null);
  };

  const handleBoardChange = async (nextBoard: BoardData) => {
    setBoard(nextBoard);
    setIsSavingBoard(true);
    setBoardError(null);

    try {
      const response = await fetch("/api/board", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(nextBoard),
      });

      if (!response.ok) {
        setBoardError("Could not save the board.");
        return;
      }

      const savedBoard = normalizeBoardData((await response.json()) as BoardData);
      setBoard(savedBoard);
    } catch {
      setBoardError("Could not save the board.");
    } finally {
      setIsSavingBoard(false);
    }
  };

  const handleSendAiMessage = async (message: string) => {
    setAiError(null);
    setIsSendingAi(true);
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ message }),
      });

      const data = (await response.json()) as {
        reply?: string;
        board?: BoardData;
        detail?: string;
      };

      if (!response.ok) {
        setAiError(data.detail ?? "Could not send the AI request.");
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      if (data.board) {
        setBoard(normalizeBoardData(data.board));
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? "No response returned." },
      ]);
    } catch {
      setAiError("Could not send the AI request.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsSendingAi(false);
    }
  };

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="rounded-[32px] border border-[var(--stroke)] bg-white/90 px-8 py-10 shadow-[var(--shadow)]">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--gray-text)]">
            Loading
          </p>
        </div>
      </main>
    );
  }

  if (!session.authenticated) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
        <div className="pointer-events-none absolute left-0 top-0 h-[420px] w-[420px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-[radial-gradient(circle,_rgba(32,157,215,0.25)_0%,_rgba(32,157,215,0.05)_55%,_transparent_70%)]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[520px] w-[520px] translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(circle,_rgba(117,57,145,0.18)_0%,_rgba(117,57,145,0.05)_55%,_transparent_75%)]" />
        <section className="relative w-full max-w-md rounded-[32px] border border-[var(--stroke)] bg-white/90 p-8 shadow-[var(--shadow)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--gray-text)]">
            Local Sign In
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-[var(--navy-dark)]">
            Kanban Studio
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--gray-text)]">
            Sign in with the local MVP credentials to access the board.
          </p>
          <form className="mt-8 space-y-4" onSubmit={handleLogin}>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gray-text)]">
                Username
              </span>
              <input
                value={formState.username}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, username: event.target.value }))
                }
                className="w-full rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-sm text-[var(--navy-dark)] outline-none transition focus:border-[var(--primary-blue)]"
                autoComplete="username"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gray-text)]">
                Password
              </span>
              <input
                type="password"
                value={formState.password}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, password: event.target.value }))
                }
                className="w-full rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-sm text-[var(--navy-dark)] outline-none transition focus:border-[var(--primary-blue)]"
                autoComplete="current-password"
              />
            </label>
            {error ? (
              <p className="text-sm font-medium text-[var(--secondary-purple)]">{error}</p>
            ) : null}
            <button
              type="submit"
              className="w-full rounded-full bg-[var(--secondary-purple)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:brightness-110 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing In" : "Sign In"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  if (isLoadingBoard || !board) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="rounded-[32px] border border-[var(--stroke)] bg-white/90 px-8 py-10 shadow-[var(--shadow)]">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--gray-text)]">
            Loading Board
          </p>
        </div>
      </main>
    );
  }

  return (
    <KanbanBoard
      board={board}
      username={session.username ?? "user"}
      onLogout={handleLogout}
      onBoardChange={handleBoardChange}
      isSaving={isSavingBoard}
      error={boardError}
    >
      <AiSidebar
        messages={messages}
        isSending={isSendingAi}
        error={aiError}
        onSend={handleSendAiMessage}
        viewMode={board.viewMode}
      />
    </KanbanBoard>
  );
};
