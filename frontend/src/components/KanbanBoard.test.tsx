import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { initialData, type BoardData } from "@/lib/kanban";

const getFirstColumn = () => screen.getAllByTestId(/column-/i)[0];

const cloneBoard = (): BoardData => structuredClone(initialData);
const reducedMotionMatchMedia = () => ({
  matches: true,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
});

const ControlledBoard = () => {
  const [board, setBoard] = useState<BoardData>(cloneBoard());
  return <KanbanBoard board={board} onBoardChange={setBoard} />;
};

describe("KanbanBoard", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

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

  it("switches between classic and arcade modes", async () => {
    render(<ControlledBoard />);

    await userEvent.click(screen.getByRole("button", { name: "arcade" }));

    expect(screen.getByRole("heading", { name: "Questboard" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Draw" })).toBeInTheDocument();
    expect(screen.getAllByText("Cost 3").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Priority medium").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "arcade" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
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

  it("updates card metadata inline", async () => {
    render(<ControlledBoard />);

    const firstColumn = screen.getByTestId("column-col-backlog");
    const card = within(firstColumn).getByTestId("card-card-1");

    await userEvent.click(
      within(card).getByRole("button", { name: "Edit Align roadmap themes" })
    );
    await userEvent.selectOptions(
      within(card).getByLabelText("Assignee role for Align roadmap themes"),
      "design"
    );
    await userEvent.selectOptions(
      within(card).getByLabelText("Priority for Align roadmap themes"),
      "low"
    );
    await userEvent.click(
      within(card).getByLabelText("Blocked status for Align roadmap themes")
    );

    expect(within(card).getByDisplayValue("design")).toBeInTheDocument();
    expect(within(card).getByDisplayValue("low")).toBeInTheDocument();
    expect(within(card).getByLabelText("Blocked status for Align roadmap themes")).toBeChecked();
  });

  it("updates draw source and target settings in arcade mode", async () => {
    render(<ControlledBoard />);

    await userEvent.click(screen.getByRole("button", { name: "arcade" }));
    await userEvent.selectOptions(screen.getByLabelText("Draw source"), "col-progress");
    await userEvent.selectOptions(screen.getByLabelText("Draw target"), "col-review");

    expect(screen.getByLabelText("Draw source")).toHaveValue("col-progress");
    expect(screen.getByLabelText("Draw target")).toHaveValue("col-review");
    expect(screen.getByText("Next Lane")).toBeInTheDocument();
  });

  it("reveals a role-matched card and only moves it after accept", async () => {
    vi.stubGlobal("matchMedia", vi.fn().mockImplementation(reducedMotionMatchMedia));
    const user = userEvent.setup();
    const board = cloneBoard();
    board.viewMode = "arcade";
    board.playerProfile.primaryRole = "design";
    board.columns[0].cardIds = ["card-1", "card-3"];
    board.columns[1].cardIds = [];

    const ControlledArcadeBoard = () => {
      const [nextBoard, setNextBoard] = useState<BoardData>(board);
      return <KanbanBoard board={nextBoard} onBoardChange={setNextBoard} />;
    };

    render(<ControlledArcadeBoard />);

    await user.click(screen.getByRole("button", { name: "Draw" }));

    const backlog = screen.getByTestId("column-col-backlog");
    const target = screen.getByTestId("column-col-discovery");
    expect(within(backlog).getByText("Prototype analytics view")).toBeInTheDocument();
    expect(within(target).queryByText("Prototype analytics view")).not.toBeInTheDocument();
    expect(screen.getByText(/matches your design role/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Accept" }));

    expect(within(backlog).queryByText("Prototype analytics view")).not.toBeInTheDocument();
    expect(within(target).getByText("Prototype analytics view")).toBeInTheDocument();
  });

  it("shows a no-match state instead of drawing off-role work", async () => {
    vi.stubGlobal("matchMedia", vi.fn().mockImplementation(reducedMotionMatchMedia));
    const user = userEvent.setup();
    const board = cloneBoard();
    board.viewMode = "arcade";
    board.playerProfile.primaryRole = "design";
    board.columns[0].cardIds = ["card-1", "card-2"];

    const ControlledArcadeBoard = () => {
      const [nextBoard, setNextBoard] = useState<BoardData>(board);
      return <KanbanBoard board={nextBoard} onBoardChange={setNextBoard} />;
    };

    render(<ControlledArcadeBoard />);

    await user.click(screen.getByRole("button", { name: "Draw" }));

    expect(
      screen.getByText("No matching cards to draw for your role right now.")
    ).toBeInTheDocument();
  });

  it("supports a single redraw and excludes blocked cards", async () => {
    vi.stubGlobal("matchMedia", vi.fn().mockImplementation(reducedMotionMatchMedia));
    const user = userEvent.setup();
    const board = cloneBoard();
    board.viewMode = "arcade";
    board.playerProfile.primaryRole = "product";
    board.columns[0].cardIds = ["card-1", "card-2", "card-4"];
    board.columns[2].cardIds = board.columns[2].cardIds.filter((cardId) => cardId !== "card-4");
    board.cards["card-1"].blocked = true;

    const ControlledArcadeBoard = () => {
      const [nextBoard, setNextBoard] = useState<BoardData>(board);
      return <KanbanBoard board={nextBoard} onBoardChange={setNextBoard} />;
    };

    render(<ControlledArcadeBoard />);

    await user.click(screen.getByRole("button", { name: "Draw" }));

    expect(screen.getByText(/matches your product role/i)).toBeInTheDocument();
    expect(screen.getAllByText("Gather customer signals").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "Redraw" }));

    expect(screen.getAllByText("Refine status language").length).toBeGreaterThan(0);
    expect(screen.getByText("0 remaining")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Redraw" })).toBeDisabled();
  });
});
