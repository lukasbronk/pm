import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Card, Column } from "@/lib/kanban";
import { KanbanCard } from "@/components/KanbanCard";
import { NewCardForm } from "@/components/NewCardForm";

type KanbanColumnProps = {
  column: Column;
  cards: Card[];
  onRename: (columnId: string, title: string) => void;
  onAddCard: (columnId: string, title: string, details: string) => void;
  onDeleteCard: (columnId: string, cardId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  canDeleteColumn: boolean;
  autoFocusTitle?: boolean;
};

export const KanbanColumn = ({
  column,
  cards,
  onRename,
  onAddCard,
  onDeleteCard,
  onDeleteColumn,
  canDeleteColumn,
  autoFocusTitle = false,
}: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const [isFresh, setIsFresh] = useState(autoFocusTitle);

  useEffect(() => {
    if (!autoFocusTitle) {
      return;
    }

    const input = titleInputRef.current;
    if (input) {
      input.focus();
      input.select();
    }

    setIsFresh(true);
    const timeoutId = window.setTimeout(() => {
      setIsFresh(false);
    }, 1400);

    return () => window.clearTimeout(timeoutId);
  }, [autoFocusTitle]);

  return (
    <section
      ref={setNodeRef}
      className={clsx(
        "flex min-h-[520px] flex-col rounded-3xl border border-[var(--stroke)] bg-[var(--surface-strong)] p-4 shadow-[var(--shadow)] transition",
        isOver && "ring-2 ring-[var(--accent-yellow)]"
      )}
      data-testid={`column-${column.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="h-2 w-10 rounded-full bg-[var(--accent-yellow)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gray-text)]">
              {cards.length} cards
            </span>
          </div>
          <input
            ref={titleInputRef}
            value={column.title}
            onChange={(event) => onRename(column.id, event.target.value)}
            placeholder="What am I called?"
            className={clsx(
              "mt-3 w-full min-w-0 rounded-xl bg-transparent px-2 py-1 font-sans text-base font-semibold text-[var(--navy-dark)] outline-none transition",
              "placeholder:text-[var(--gray-text)] focus:bg-[rgba(236,173,10,0.08)]",
              isFresh && "title-shimmer ring-2 ring-[var(--accent-yellow)]"
            )}
            aria-label="Column title"
          />
        </div>
        <button
          type="button"
          onClick={() => onDeleteColumn(column.id)}
          disabled={!canDeleteColumn}
          className="shrink-0 rounded-full border border-[var(--stroke)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gray-text)] transition hover:text-[var(--navy-dark)] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Delete ${column.title} column`}
        >
          Remove
        </button>
      </div>
      <div className="mt-4 flex flex-1 flex-col gap-3">
        <SortableContext items={column.cardIds} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onDelete={(cardId) => onDeleteCard(column.id, cardId)}
            />
          ))}
        </SortableContext>
        {cards.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-[var(--stroke)] px-3 py-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gray-text)]">
            Drop a card here
          </div>
        )}
      </div>
      <NewCardForm
        onAdd={(title, details) => onAddCard(column.id, title, details)}
      />
    </section>
  );
};
