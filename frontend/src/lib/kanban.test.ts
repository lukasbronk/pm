import {
  acceptDrawCard,
  drawCardForBoard,
  initialData,
  moveCard,
  normalizeBoardData,
  type BoardData,
  type Column,
} from "@/lib/kanban";

describe("moveCard", () => {
  const baseColumns: Column[] = [
    { id: "col-a", title: "A", cardIds: ["card-1", "card-2"] },
    { id: "col-b", title: "B", cardIds: ["card-3"] },
  ];

  it("reorders cards in the same column", () => {
    const result = moveCard(baseColumns, "card-2", "card-1");
    expect(result[0].cardIds).toEqual(["card-2", "card-1"]);
  });

  it("moves cards to another column", () => {
    const result = moveCard(baseColumns, "card-2", "card-3");
    expect(result[0].cardIds).toEqual(["card-1"]);
    expect(result[1].cardIds).toEqual(["card-2", "card-3"]);
  });

  it("drops cards to the end of a column", () => {
    const result = moveCard(baseColumns, "card-1", "col-b");
    expect(result[0].cardIds).toEqual(["card-2"]);
    expect(result[1].cardIds).toEqual(["card-3", "card-1"]);
  });
});

describe("drawCardForBoard", () => {
  const cloneBoard = (): BoardData => structuredClone(initialData);

  it("normalizes draw defaults for older boards", () => {
    const normalized = normalizeBoardData({
      columns: initialData.columns,
      cards: initialData.cards,
    });

    expect(normalized.playerProfile.primaryRole).toBe("product");
    expect(normalized.drawSettings.sourceColumnId).toBe("col-backlog");
    expect(normalized.runState.redrawsRemaining).toBe(1);
    expect(normalized.cards["card-1"].blocked).toBe(false);
  });

  it("draws only role-matched cards from backlog", () => {
    const board = cloneBoard();
    board.viewMode = "arcade";
    board.playerProfile.primaryRole = "design";
    board.columns[0].cardIds = ["card-1", "card-3"];

    const result = drawCardForBoard(board, { randomValue: 0 });

    expect(result?.cardId).toBe("card-3");
  });

  it("returns null when only off-role backlog cards exist", () => {
    const board = cloneBoard();
    board.viewMode = "arcade";
    board.playerProfile.primaryRole = "design";

    const result = drawCardForBoard(board);

    expect(result).toBeNull();
  });

  it("ignores blocked cards and stamps accepted draws", () => {
    const board = cloneBoard();
    board.viewMode = "arcade";
    board.playerProfile.primaryRole = "product";
    board.cards["card-1"].blocked = true;

    const result = drawCardForBoard(board, { randomValue: 0 });

    expect(result?.cardId).toBe("card-2");

    const accepted = acceptDrawCard(board, "card-2", "2026-04-22T10:00:00.000Z");
    expect(accepted.columns[0].cardIds).not.toContain("card-2");
    expect(accepted.columns[1].cardIds).toContain("card-2");
    expect(accepted.cards["card-2"].drawState.lastDrawnAt).toBe(
      "2026-04-22T10:00:00.000Z"
    );
  });
});
