import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { initialData, type BoardData } from "@/lib/kanban";

const getFirstColumn = () => screen.getAllByTestId(/column-/i)[0];

const cloneBoard = (): BoardData => structuredClone(initialData);

const ControlledBoard = () => {
  const [board, setBoard] = useState<BoardData>(cloneBoard());
  return <KanbanBoard board={board} onBoardChange={setBoard} />;
};

describe("KanbanBoard", () => {
  it("renders the seeded columns", () => {
    render(<KanbanBoard board={cloneBoard()} />);
    expect(screen.getAllByTestId(/column-/i)).toHaveLength(5);
  });

  it("renames a column", async () => {
    render(<ControlledBoard />);
    const column = getFirstColumn();
    const input = within(column).getByLabelText("Column title");
    await userEvent.clear(input);
    await userEvent.type(input, "New Name");
    expect(input).toHaveValue("New Name");
  });

  it("adds and removes a card", async () => {
    render(<ControlledBoard />);
    const column = getFirstColumn();
    const addButton = within(column).getByRole("button", {
      name: /add a card/i,
    });
    await userEvent.click(addButton);

    const titleInput = within(column).getByPlaceholderText(/card title/i);
    await userEvent.type(titleInput, "New card");
    const detailsInput = within(column).getByPlaceholderText(/details/i);
    await userEvent.type(detailsInput, "Notes");

    await userEvent.click(within(column).getByRole("button", { name: /add card/i }));

    expect(within(column).getByText("New card")).toBeInTheDocument();

    const deleteButton = within(column).getByRole("button", {
      name: /delete new card/i,
    });
    await userEvent.click(deleteButton);

    expect(within(column).queryByText("New card")).not.toBeInTheDocument();
  });

  it("adds and removes a column", async () => {
    render(<ControlledBoard />);

    await userEvent.click(screen.getByRole("button", { name: "Add Column" }));
    expect(screen.getAllByTestId(/column-/i)).toHaveLength(6);

    const newColumnTitle = document.activeElement as HTMLInputElement;
    expect(newColumnTitle).toHaveFocus();
    expect(newColumnTitle).toHaveAttribute("placeholder", "What am I called?");
    expect(newColumnTitle).toHaveValue("");
    const newColumn = newColumnTitle.closest("section");
    expect(newColumn).not.toBeNull();
    expect(newColumnTitle).toHaveClass("title-shimmer");

    await userEvent.click(
      within(newColumn as HTMLElement).getByRole("button", {
        name: /delete\s+column/i,
      })
    );

    expect(screen.getAllByTestId(/column-/i)).toHaveLength(5);
  });
});
