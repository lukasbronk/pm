import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import {
  useState,
  type ChangeEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import type { Card, ViewMode, WorkType, Priority } from "@/lib/kanban";

type KanbanCardProps = {
  card: Card;
  onDelete: (cardId: string) => void;
  onUpdate: (
    cardId: string,
    updates: Partial<
      Pick<Card, "workType" | "assigneeRole" | "effort" | "priority" | "blocked">
    >
  ) => void;
  viewMode?: ViewMode;
};

export const KanbanCard = ({
  card,
  onDelete,
  onUpdate,
  viewMode = "classic",
}: KanbanCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });
  const [isEditing, setIsEditing] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const isArcadeMode = viewMode === "arcade";
  const stopPointerPropagation = (event: PointerEvent<HTMLElement>) => {
    event.stopPropagation();
  };
  const stopClickPropagation = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };
  const handleSelectUpdate =
    <K extends "workType" | "priority">(
      field: K
    ) =>
    (event: ChangeEvent<HTMLSelectElement>) => {
      onUpdate(card.id, { [field]: event.target.value } as Pick<Card, K>);
    };
  const handleAssigneeRoleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onUpdate(card.id, {
      assigneeRole: event.target.value ? (event.target.value as WorkType) : null,
    });
  };
  const handleEffortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onUpdate(card.id, {
      effort: event.target.value ? Number(event.target.value) : null,
    });
  };
  const handleBlockedChange = (event: ChangeEvent<HTMLInputElement>) => {
    onUpdate(card.id, {
      blocked: event.target.checked,
    });
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={clsx(
        "rounded-2xl border px-4 py-4",
        "bg-[var(--card-bg)] text-[var(--card-text)] shadow-[var(--card-shadow)] border-[var(--card-border)]",
        "transition-all duration-150",
        isArcadeMode && "overflow-hidden",
        isDragging && "opacity-60 shadow-[var(--card-shadow-active)]"
      )}
      {...attributes}
      {...listeners}
      data-testid={`card-${card.id}`}
    >
      {isArcadeMode ? (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[var(--meta-border)] bg-[var(--meta-bg)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--meta-text)]">
            Cost {card.effort ?? "-"}
          </span>
          <span className="rounded-full border border-[var(--meta-border)] bg-[var(--meta-bg)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--meta-text)]">
            Class {card.workType}
          </span>
          <span className="rounded-full border border-[var(--meta-border)] bg-[var(--meta-bg)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--meta-text)]">
            Priority {card.priority}
          </span>
          {card.blocked ? (
            <span className="rounded-full border border-[var(--meta-border)] bg-[rgba(117,57,145,0.12)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--secondary-purple)]">
              Blocked
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-display text-base font-semibold text-[var(--card-text)]">
            {card.title}
          </h4>
          <p className="mt-2 text-sm leading-6 text-[var(--card-muted)]">
            {card.details}
          </p>
        </div>
        <div
          className="flex shrink-0 items-center gap-2"
          onPointerDown={stopPointerPropagation}
          onClick={stopClickPropagation}
        >
          <button
            type="button"
            onClick={() => setIsEditing((prev) => !prev)}
            className="rounded-full border border-transparent px-2 py-1 text-xs font-semibold text-[var(--card-muted)] transition hover:border-[var(--stroke)] hover:text-[var(--card-text)]"
            aria-expanded={isEditing}
            aria-label={`Edit ${card.title}`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(card.id)}
            className="rounded-full border border-transparent px-2 py-1 text-xs font-semibold text-[var(--card-muted)] transition hover:border-[var(--stroke)] hover:text-[var(--card-text)]"
            aria-label={`Delete ${card.title}`}
          >
            Remove
          </button>
        </div>
      </div>
      {isEditing ? (
        <div
          className="mt-4 grid gap-3 rounded-2xl border border-[var(--meta-border)] bg-[var(--meta-bg)] p-3"
          onPointerDown={stopPointerPropagation}
          onClick={stopClickPropagation}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--card-muted)]">
                Class
              </span>
              <select
                aria-label={`Class for ${card.title}`}
                value={card.workType}
                onChange={handleSelectUpdate("workType")}
                className="mt-2 w-full rounded-xl border border-[var(--meta-border)] bg-[var(--card-bg)] px-3 py-2 text-sm font-medium text-[var(--card-text)] outline-none transition focus:border-[var(--primary-blue)]"
              >
                {(["product", "design", "code", "qa", "ops"] as WorkType[]).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--card-muted)]">
                Assignee Role
              </span>
              <select
                aria-label={`Assignee role for ${card.title}`}
                value={card.assigneeRole ?? ""}
                onChange={handleAssigneeRoleChange}
                className="mt-2 w-full rounded-xl border border-[var(--meta-border)] bg-[var(--card-bg)] px-3 py-2 text-sm font-medium text-[var(--card-text)] outline-none transition focus:border-[var(--primary-blue)]"
              >
                <option value="">Auto</option>
                {(["product", "design", "code", "qa", "ops"] as WorkType[]).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--card-muted)]">
                Cost
              </span>
              <select
                aria-label={`Cost for ${card.title}`}
                value={card.effort ?? ""}
                onChange={handleEffortChange}
                className="mt-2 w-full rounded-xl border border-[var(--meta-border)] bg-[var(--card-bg)] px-3 py-2 text-sm font-medium text-[var(--card-text)] outline-none transition focus:border-[var(--primary-blue)]"
              >
                <option value="">Unset</option>
                {[1, 2, 3, 4, 5].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--card-muted)]">
                Priority
              </span>
              <select
                aria-label={`Priority for ${card.title}`}
                value={card.priority}
                onChange={handleSelectUpdate("priority")}
                className="mt-2 w-full rounded-xl border border-[var(--meta-border)] bg-[var(--card-bg)] px-3 py-2 text-sm font-medium text-[var(--card-text)] outline-none transition focus:border-[var(--primary-blue)]"
              >
                {(["low", "medium", "high"] as Priority[]).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="inline-flex items-center gap-3 rounded-xl border border-[var(--meta-border)] bg-[var(--card-bg)] px-3 py-2">
            <input
              type="checkbox"
              checked={card.blocked}
              onChange={handleBlockedChange}
              aria-label={`Blocked status for ${card.title}`}
            />
            <span className="text-sm font-medium text-[var(--card-text)]">
              Card is blocked
            </span>
          </label>
        </div>
      ) : null}
    </article>
  );
};
