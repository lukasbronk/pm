"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { KanbanCardPreview } from "@/components/KanbanCardPreview";
import { KanbanColumn } from "@/components/KanbanColumn";
import {
  acceptDrawCard,
  consumeRedraw,
  createId,
  drawCardForBoard,
  getDefaultTargetColumnId,
  moveCard,
  type BoardData,
  type DrawResult,
  type ViewMode,
  type WorkType,
} from "@/lib/kanban";

type KanbanBoardProps = {
  board: BoardData;
  username?: string;
  onLogout?: () => void;
  onBoardChange?: (board: BoardData) => void;
  isSaving?: boolean;
  error?: string | null;
  children?: React.ReactNode;
};

type DrawFlowState =
  | {
      phase: "shuffling";
      shownCardIds: string[];
    }
  | {
      phase: "revealed" | "accepting";
      draw: DrawResult;
      shownCardIds: string[];
    }
  | {
      phase: "empty";
      message: string;
      shownCardIds: string[];
    };

const DRAW_EMPTY_MESSAGE = "No matching cards to draw for your role right now.";

export const KanbanBoard = ({
  board,
  username = "user",
  onLogout,
  onBoardChange,
  isSaving = false,
  error = null,
  children,
}: KanbanBoardProps) => {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [freshColumnId, setFreshColumnId] = useState<string | null>(null);
  const [drawFlow, setDrawFlow] = useState<DrawFlowState | null>(null);
  const [highlightedColumnId, setHighlightedColumnId] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const revealTimeoutRef = useRef<number | null>(null);
  const acceptTimeoutRef = useRef<number | null>(null);
  const highlightTimeoutRef = useRef<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const cardsById = useMemo(() => board.cards, [board.cards]);
  const isArcadeMode = board.viewMode === "arcade";
  const availableTargetColumns = board.columns.filter(
    (column) => column.id !== board.drawSettings.sourceColumnId
  );
  const targetColumn = board.columns.find(
    (column) => column.id === board.drawSettings.targetColumnId
  );

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updatePreference);
      return () => mediaQuery.removeEventListener("change", updatePreference);
    }

    mediaQuery.addListener(updatePreference);
    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  useEffect(() => {
    if (isArcadeMode) {
      return;
    }
    setDrawFlow(null);
    setHighlightedColumnId(null);
  }, [isArcadeMode]);

  useEffect(
    () => () => {
      if (revealTimeoutRef.current) {
        window.clearTimeout(revealTimeoutRef.current);
      }
      if (acceptTimeoutRef.current) {
        window.clearTimeout(acceptTimeoutRef.current);
      }
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    },
    []
  );

  const queueColumnHighlight = (columnId: string) => {
    setHighlightedColumnId(columnId);
    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightedColumnId(null);
      highlightTimeoutRef.current = null;
    }, 900);
  };

  const revealDrawCandidate = (nextBoard: BoardData, shownCardIds: string[]) => {
    const result = drawCardForBoard(nextBoard, { excludedCardIds: shownCardIds });
    if (!result) {
      setDrawFlow({
        phase: "empty",
        message: DRAW_EMPTY_MESSAGE,
        shownCardIds,
      });
      return;
    }

    const nextShownCardIds = [...shownCardIds, result.cardId];
    if (prefersReducedMotion) {
      setDrawFlow({
        phase: "revealed",
        draw: result,
        shownCardIds: nextShownCardIds,
      });
      return;
    }

    setDrawFlow({
      phase: "shuffling",
      shownCardIds,
    });

    if (revealTimeoutRef.current) {
      window.clearTimeout(revealTimeoutRef.current);
    }
    revealTimeoutRef.current = window.setTimeout(() => {
      setDrawFlow({
        phase: "revealed",
        draw: result,
        shownCardIds: nextShownCardIds,
      });
      revealTimeoutRef.current = null;
    }, 420);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCardId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCardId(null);

    if (!over || active.id === over.id) {
      return;
    }

    onBoardChange?.({
      ...board,
      columns: moveCard(board.columns, active.id as string, over.id as string),
    });
  };

  const handleRenameColumn = (columnId: string, title: string) => {
    if (columnId === freshColumnId && title.trim().length > 0) {
      setFreshColumnId(null);
    }

    onBoardChange?.({
      ...board,
      columns: board.columns.map((column) =>
        column.id === columnId ? { ...column, title } : column
      ),
    });
  };

  const handleAddCard = (columnId: string, title: string, details: string) => {
    const id = createId("card");
    onBoardChange?.({
      ...board,
      cards: {
        ...board.cards,
        [id]: {
          id,
          title,
          details: details || "No details yet.",
          workType: "product",
          effort: null,
          priority: "medium",
          assigneeRole: null,
          blocked: false,
          drawState: {
            lastDrawnAt: null,
          },
        },
      },
      columns: board.columns.map((column) =>
        column.id === columnId
          ? { ...column, cardIds: [...column.cardIds, id] }
          : column
      ),
    });
  };

  const handleDeleteCard = (columnId: string, cardId: string) => {
    onBoardChange?.({
      ...board,
      cards: Object.fromEntries(
        Object.entries(board.cards).filter(([id]) => id !== cardId)
      ),
      columns: board.columns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              cardIds: column.cardIds.filter((id) => id !== cardId),
            }
          : column
      ),
    });
  };

  const handleUpdateCard = (
    cardId: string,
    updates: Partial<
      Pick<
        BoardData["cards"][string],
        "workType" | "assigneeRole" | "effort" | "priority" | "blocked"
      >
    >
  ) => {
    const existingCard = board.cards[cardId];
    if (!existingCard) {
      return;
    }

    onBoardChange?.({
      ...board,
      cards: {
        ...board.cards,
        [cardId]: {
          ...existingCard,
          ...updates,
        },
      },
    });
  };

  const handleAddColumn = () => {
    const id = createId("col");
    setFreshColumnId(id);
    onBoardChange?.({
      ...board,
      columns: [...board.columns, { id, title: "", cardIds: [] }],
    });
  };

  const handleDeleteColumn = (columnId: string) => {
    if (board.columns.length <= 1) {
      return;
    }

    const sourceIndex = board.columns.findIndex((column) => column.id === columnId);
    if (sourceIndex === -1) {
      return;
    }

    const targetIndex = sourceIndex === 0 ? 1 : sourceIndex - 1;
    const targetColumn = board.columns[targetIndex];
    const sourceColumn = board.columns[sourceIndex];
    const nextColumns = board.columns
      .filter((column) => column.id !== columnId)
      .map((column) =>
        column.id === targetColumn.id
          ? {
              ...column,
              cardIds: [...column.cardIds, ...sourceColumn.cardIds],
            }
          : column
      );
    const nextSourceColumnId =
      board.drawSettings.sourceColumnId === columnId
        ? targetColumn.id
        : board.drawSettings.sourceColumnId;
    const nextTargetColumnId =
      board.drawSettings.targetColumnId === columnId ||
      board.drawSettings.targetColumnId === nextSourceColumnId
        ? getDefaultTargetColumnId(nextColumns, nextSourceColumnId)
        : board.drawSettings.targetColumnId;

    onBoardChange?.({
      ...board,
      drawSettings: {
        sourceColumnId: nextSourceColumnId,
        targetColumnId: nextTargetColumnId,
      },
      columns: nextColumns,
    });
  };

  const handleModeChange = (viewMode: ViewMode) => {
    if (board.viewMode === viewMode) {
      return;
    }

    onBoardChange?.({
      ...board,
      viewMode,
    });
  };

  const handlePrimaryRoleChange = (primaryRole: WorkType) => {
    onBoardChange?.({
      ...board,
      playerProfile: {
        ...board.playerProfile,
        primaryRole,
      },
    });
    setDrawFlow(null);
  };

  const handleDrawSourceChange = (sourceColumnId: string) => {
    const nextTargetColumnId =
      board.drawSettings.targetColumnId !== sourceColumnId
        ? board.drawSettings.targetColumnId
        : getDefaultTargetColumnId(board.columns, sourceColumnId);

    onBoardChange?.({
      ...board,
      drawSettings: {
        sourceColumnId,
        targetColumnId: nextTargetColumnId,
      },
    });
    setDrawFlow(null);
  };

  const handleDrawTargetChange = (targetColumnId: string) => {
    if (targetColumnId === board.drawSettings.sourceColumnId) {
      return;
    }

    onBoardChange?.({
      ...board,
      drawSettings: {
        ...board.drawSettings,
        targetColumnId,
      },
    });
    setDrawFlow(null);
  };

  const handleDraw = () => {
    revealDrawCandidate(board, []);
  };

  const handleSkipDraw = () => {
    setDrawFlow(null);
  };

  const handleRedraw = () => {
    if (
      !drawFlow ||
      drawFlow.phase !== "revealed" ||
      board.runState.redrawsRemaining <= 0
    ) {
      return;
    }

    const nextBoard = consumeRedraw(board);
    onBoardChange?.(nextBoard);
    revealDrawCandidate(nextBoard, drawFlow.shownCardIds);
  };

  const handleAcceptDraw = () => {
    if (!drawFlow || drawFlow.phase !== "revealed") {
      return;
    }

    const nextBoard = acceptDrawCard(board, drawFlow.draw.cardId);
    const finalizeAccept = () => {
      onBoardChange?.(nextBoard);
      queueColumnHighlight(drawFlow.draw.targetColumnId);
      setDrawFlow(null);
      acceptTimeoutRef.current = null;
    };

    if (prefersReducedMotion) {
      finalizeAccept();
      return;
    }

    setDrawFlow({
      ...drawFlow,
      phase: "accepting",
    });

    if (acceptTimeoutRef.current) {
      window.clearTimeout(acceptTimeoutRef.current);
    }
    acceptTimeoutRef.current = window.setTimeout(finalizeAccept, 280);
  };

  const activeCard = activeCardId ? cardsById[activeCardId] : null;
  const currentDrawCard =
    drawFlow && (drawFlow.phase === "revealed" || drawFlow.phase === "accepting")
      ? board.cards[drawFlow.draw.cardId]
      : null;
  const isDrawBusy = drawFlow?.phase === "shuffling" || drawFlow?.phase === "accepting";
  const canDraw = availableTargetColumns.length > 0;

  return (
    <div
      className={[
        "relative overflow-hidden transition-colors duration-300",
        "bg-[var(--shell-bg)] text-[var(--shell-tone)]",
      ].join(" ")}
      data-view-mode={board.viewMode}
    >
      <div className="pointer-events-none absolute left-0 top-0 h-[420px] w-[420px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-[radial-gradient(circle,_rgba(32,157,215,0.25)_0%,_rgba(32,157,215,0.05)_55%,_transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[520px] w-[520px] translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(circle,_rgba(117,57,145,0.18)_0%,_rgba(117,57,145,0.05)_55%,_transparent_75%)]" />

      <main className="relative mx-auto flex min-h-screen max-w-[1680px] flex-col gap-10 px-6 pb-16 pt-12">
        <header
          className={[
            "flex flex-col gap-6 rounded-[32px] border border-[var(--stroke)] p-8 shadow-[var(--shadow)] backdrop-blur transition-colors duration-300",
            "bg-[var(--panel-bg)]",
          ].join(" ")}
        >
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p
                className={[
                  "text-xs font-semibold uppercase tracking-[0.35em]",
                  "text-[var(--shell-muted)]",
                ].join(" ")}
              >
                {isArcadeMode ? "Questboard Arcade Run" : "Single Board Kanban"}
              </p>
              <h1
                className={[
                  "mt-3 font-display text-4xl font-semibold",
                  "text-[var(--shell-tone)]",
                ].join(" ")}
              >
                {isArcadeMode ? "Questboard" : "Kanban Studio"}
              </h1>
              <p
                className={[
                  "mt-3 max-w-xl text-sm leading-6",
                  "text-[var(--shell-muted)]",
                ].join(" ")}
              >
                {isArcadeMode
                  ? "Shape the run, balance the deck, and keep every next move visible."
                  : "Keep momentum visible. Add or remove columns, drag cards between stages, and capture quick notes without getting buried in settings."}
              </p>
            </div>
            <div
              className={[
                "rounded-2xl border px-5 py-4",
                "border-[var(--stroke)] bg-[var(--panel-strong-bg)]",
              ].join(" ")}
            >
              <p
                className={[
                  "text-xs font-semibold uppercase tracking-[0.25em]",
                  "text-[var(--shell-muted)]",
                ].join(" ")}
              >
                Active Mode
              </p>
              <div className="mt-3 inline-flex rounded-full border border-[var(--stroke)] p-1">
                {(["classic", "arcade"] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleModeChange(mode)}
                    className={[
                      "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition",
                      board.viewMode === mode
                        ? "bg-[var(--secondary-purple)] text-white"
                        : isArcadeMode
                          ? "text-[var(--shell-muted)] hover:text-white"
                          : "text-[var(--navy-dark)] hover:text-[var(--primary-blue)]",
                    ].join(" ")}
                    aria-pressed={board.viewMode === mode}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <p
                className={[
                  "mt-3 text-xs font-semibold uppercase tracking-[0.25em]",
                  "text-[var(--shell-muted)]",
                ].join(" ")}
              >
                Signed In
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--primary-blue)]">{username}</p>
              {onLogout ? (
                <button
                  type="button"
                  onClick={onLogout}
                  className="mt-3 rounded-full border border-[var(--stroke)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--navy-dark)] transition hover:border-[var(--primary-blue)] hover:text-[var(--primary-blue)]"
                >
                  Log Out
                </button>
              ) : (
                <p className="mt-2 text-lg font-semibold text-[var(--primary-blue)]">
                  One board. Flexible columns. Zero clutter.
                </p>
              )}
            </div>
          </div>
          <div
            className={[
              "flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3",
              "border-[var(--stroke)] bg-[var(--panel-strong-bg)]",
            ].join(" ")}
          >
            <p
              className={[
                "text-xs font-semibold uppercase tracking-[0.2em]",
                "text-[var(--shell-muted)]",
              ].join(" ")}
            >
              {isSaving
                ? "Saving changes"
                : isArcadeMode
                  ? "Run state synced locally"
                  : "Board synced locally"}
            </p>
            {error ? (
              <p className="text-sm font-medium text-[var(--secondary-purple)]">{error}</p>
            ) : null}
          </div>
          {isArcadeMode ? (
            <section className="rounded-[28px] border border-[var(--stroke)] bg-[var(--panel-strong-bg)] p-5 shadow-[var(--shadow)]">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-wrap items-end gap-4">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--shell-muted)]">
                      Primary Role
                    </span>
                    <select
                      aria-label="Primary role"
                      value={board.playerProfile.primaryRole}
                      onChange={(event) =>
                        handlePrimaryRoleChange(event.target.value as WorkType)
                      }
                      className="mt-2 rounded-2xl border border-[var(--stroke)] bg-[var(--panel-bg)] px-4 py-3 text-sm font-semibold text-[var(--shell-tone)] outline-none transition focus:border-[var(--accent-yellow)]"
                    >
                      <option value="product">Product</option>
                      <option value="design">Design</option>
                      <option value="code">Code</option>
                      <option value="qa">QA</option>
                      <option value="ops">Ops</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--shell-muted)]">
                      Draw From
                    </span>
                    <select
                      aria-label="Draw source"
                      value={board.drawSettings.sourceColumnId}
                      onChange={(event) => handleDrawSourceChange(event.target.value)}
                      className="mt-2 rounded-2xl border border-[var(--stroke)] bg-[var(--panel-bg)] px-4 py-3 text-sm font-semibold text-[var(--shell-tone)] outline-none transition focus:border-[var(--accent-yellow)]"
                    >
                      {board.columns.map((column) => (
                        <option key={column.id} value={column.id}>
                          {column.title || "Untitled column"}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--shell-muted)]">
                      Accept Into
                    </span>
                    <select
                      aria-label="Draw target"
                      value={
                        availableTargetColumns.length === 0
                          ? ""
                          : board.drawSettings.targetColumnId
                      }
                      onChange={(event) => handleDrawTargetChange(event.target.value)}
                      disabled={availableTargetColumns.length === 0}
                      className="mt-2 rounded-2xl border border-[var(--stroke)] bg-[var(--panel-bg)] px-4 py-3 text-sm font-semibold text-[var(--shell-tone)] outline-none transition focus:border-[var(--accent-yellow)]"
                    >
                      {availableTargetColumns.length === 0 ? (
                        <option value="">No destination columns</option>
                      ) : (
                        availableTargetColumns.map((column) => (
                          <option key={column.id} value={column.id}>
                            {column.title || "Untitled column"}
                          </option>
                        ))
                      )}
                    </select>
                  </label>
                  <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-bg)] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--shell-muted)]">
                      Next Lane
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[var(--shell-tone)]">
                      {targetColumn?.title ?? "Next work"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-bg)] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--shell-muted)]">
                      Redraws
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[var(--shell-tone)]">
                      {board.runState.redrawsRemaining} remaining
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDraw}
                  disabled={isDrawBusy || !canDraw}
                  className={[
                    "draw-button rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white transition",
                    isDrawBusy || !canDraw
                      ? "cursor-wait bg-[var(--primary-blue)]/70"
                      : "bg-[var(--secondary-purple)] hover:brightness-110",
                  ].join(" ")}
                >
                  {drawFlow?.phase === "shuffling" ? "Drawing" : "Draw"}
                </button>
              </div>
              {drawFlow ? (
                <div className="mt-5 rounded-[24px] border border-[var(--stroke)] bg-[var(--panel-bg)] p-4">
                  {drawFlow.phase === "shuffling" ? (
                    <div className="draw-reveal-shell">
                      <div className="draw-placeholder-card" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--shell-muted)]">
                          Drawing from backlog
                        </p>
                        <p className="mt-2 text-sm text-[var(--shell-muted)]">
                          Weighing role fit, priority, effort, and recency.
                        </p>
                      </div>
                    </div>
                  ) : drawFlow.phase === "empty" ? (
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--shell-muted)]">
                          Draw Unavailable
                        </p>
                        <p className="mt-2 text-sm text-[var(--shell-tone)]">
                          {drawFlow.message}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSkipDraw}
                        className="rounded-full border border-[var(--stroke)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--shell-tone)] transition hover:border-[var(--accent-yellow)]"
                      >
                        Close
                      </button>
                    </div>
                  ) : currentDrawCard ? (
                    <div className="draw-reveal-shell">
                      <div
                        className={[
                          "draw-preview-wrap",
                          drawFlow.phase === "accepting" ? "draw-preview-wrap--flight" : "",
                        ].join(" ")}
                      >
                        <KanbanCardPreview card={currentDrawCard} viewMode={board.viewMode} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--shell-muted)]">
                          {drawFlow.phase === "accepting" ? "Accepted" : "Card Drawn"}
                        </p>
                        <h3 className="mt-2 font-display text-2xl font-semibold text-[var(--shell-tone)]">
                          {currentDrawCard.title}
                        </h3>
                        <div className="mt-4 rounded-2xl border border-[var(--stroke)] bg-[var(--panel-strong-bg)] px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--shell-muted)]">
                            Why This Draw
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[var(--shell-tone)]">
                            {drawFlow.draw.whyThisDraw}
                          </p>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={handleAcceptDraw}
                            disabled={drawFlow.phase === "accepting"}
                            className="rounded-full bg-[var(--secondary-purple)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={handleRedraw}
                            disabled={
                              drawFlow.phase === "accepting" ||
                              board.runState.redrawsRemaining <= 0
                            }
                            className="rounded-full border border-[var(--stroke)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--shell-tone)] transition hover:border-[var(--accent-yellow)] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Redraw
                          </button>
                          <button
                            type="button"
                            onClick={handleSkipDraw}
                            disabled={drawFlow.phase === "accepting"}
                            className="rounded-full border border-[var(--stroke)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--shell-muted)] transition hover:text-[var(--shell-tone)] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Skip
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>
          ) : null}
          <div className="flex flex-wrap items-center gap-4">
            {board.columns.map((column) => (
              <div
                key={column.id}
                className="flex items-center gap-2 rounded-full border border-[var(--stroke)] bg-[var(--panel-strong-bg)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--shell-tone)]"
              >
                <span className="h-2 w-2 rounded-full bg-[var(--accent-yellow)]" />
                {column.title}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddColumn}
              className="rounded-full border border-dashed border-[var(--primary-blue)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary-blue)] transition hover:bg-[var(--primary-blue)] hover:text-white"
            >
              Add Column
            </button>
          </div>
        </header>

        <div className="relative">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="-mx-2 overflow-x-auto pb-4">
              <section className="flex min-w-max gap-6 px-2">
                {board.columns.map((column) => (
                  <div
                    key={column.id}
                    className="w-[min(280px,calc((100vw-8rem)/5))] min-w-[240px] max-w-[280px] flex-none"
                  >
                    <KanbanColumn
                      column={column}
                      cards={column.cardIds.map((cardId) => board.cards[cardId])}
                      onRename={handleRenameColumn}
                      onAddCard={handleAddCard}
                      onDeleteCard={handleDeleteCard}
                      onUpdateCard={handleUpdateCard}
                      onDeleteColumn={handleDeleteColumn}
                      canDeleteColumn={board.columns.length > 1}
                      autoFocusTitle={column.id === freshColumnId}
                      viewMode={board.viewMode}
                      isHighlighted={column.id === highlightedColumnId}
                    />
                  </div>
                ))}
              </section>
            </div>
            <DragOverlay>
              {activeCard ? (
                <div className="w-[260px]">
                  <KanbanCardPreview card={activeCard} viewMode={board.viewMode} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
          {children}
        </div>
      </main>
    </div>
  );
};
