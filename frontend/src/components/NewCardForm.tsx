import clsx from "clsx";
import { useState, type FormEvent } from "react";
import type { ViewMode } from "@/lib/kanban";

const initialFormState = { title: "", details: "" };

type NewCardFormProps = {
  onAdd: (title: string, details: string) => void;
  viewMode?: ViewMode;
};

export const NewCardForm = ({
  onAdd,
  viewMode = "classic",
}: NewCardFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formState, setFormState] = useState(initialFormState);
  const isArcadeMode = viewMode === "arcade";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.title.trim()) {
      return;
    }
    onAdd(formState.title.trim(), formState.details.trim());
    setFormState(initialFormState);
    setIsOpen(false);
  };

  return (
    <div className="mt-4">
      {isOpen ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={formState.title}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, title: event.target.value }))
            }
            placeholder="Card title"
            className="w-full rounded-xl border border-[var(--stroke)] bg-[var(--card-bg)] px-3 py-2 text-sm font-medium text-[var(--card-text)] outline-none transition focus:border-[var(--primary-blue)]"
            required
          />
          <textarea
            value={formState.details}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, details: event.target.value }))
            }
            placeholder="Details"
            rows={3}
            className="w-full resize-none rounded-xl border border-[var(--stroke)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--card-muted)] outline-none transition focus:border-[var(--primary-blue)]"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="rounded-full bg-[var(--secondary-purple)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:brightness-110"
            >
              Add card
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setFormState(initialFormState);
              }}
              className="rounded-full border border-[var(--stroke)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--card-muted)] transition hover:text-[var(--card-text)]"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={clsx(
            "w-full rounded-full border border-dashed border-[var(--stroke)] px-3 py-2 text-xs font-semibold uppercase tracking-wide transition hover:border-[var(--primary-blue)]",
            isArcadeMode ? "text-[var(--accent-yellow)]" : "text-[var(--primary-blue)]"
          )}
        >
          Add a card
        </button>
      )}
    </div>
  );
};
