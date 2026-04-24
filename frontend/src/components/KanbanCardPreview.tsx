import type { Card, ViewMode } from "@/lib/kanban";

type KanbanCardPreviewProps = {
  card: Card;
  viewMode?: ViewMode;
};

export const KanbanCardPreview = ({
  card,
  viewMode = "classic",
}: KanbanCardPreviewProps) => (
  <article className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-4 shadow-[var(--card-shadow-active)]">
    {viewMode === "arcade" ? (
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
    </div>
  </article>
);
