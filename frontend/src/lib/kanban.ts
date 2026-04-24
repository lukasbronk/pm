export type ViewMode = "classic" | "arcade";

export type WorkType = "product" | "design" | "code" | "qa" | "ops";

export type Priority = "low" | "medium" | "high";

export type PlayerProfile = {
  primaryRole: WorkType;
};

export type DrawSettings = {
  sourceColumnId: string;
  targetColumnId: string;
};

export type RunState = {
  redrawsRemaining: number;
};

export type DrawState = {
  lastDrawnAt: string | null;
};

export type Card = {
  id: string;
  title: string;
  details: string;
  workType: WorkType;
  effort: number | null;
  priority: Priority;
  assigneeRole: WorkType | null;
  blocked: boolean;
  drawState: DrawState;
};

export type Column = {
  id: string;
  title: string;
  cardIds: string[];
};

export type BoardData = {
  viewMode: ViewMode;
  themeId: string;
  playerProfile: PlayerProfile;
  drawSettings: DrawSettings;
  runState: RunState;
  columns: Column[];
  cards: Record<string, Card>;
};

export const initialData: BoardData = {
  viewMode: "classic",
  themeId: "core",
  playerProfile: {
    primaryRole: "product",
  },
  drawSettings: {
    sourceColumnId: "col-backlog",
    targetColumnId: "col-discovery",
  },
  runState: {
    redrawsRemaining: 1,
  },
  columns: [
    { id: "col-backlog", title: "Backlog", cardIds: ["card-1", "card-2"] },
    { id: "col-discovery", title: "Discovery", cardIds: ["card-3"] },
    {
      id: "col-progress",
      title: "In Progress",
      cardIds: ["card-4", "card-5"],
    },
    { id: "col-review", title: "Review", cardIds: ["card-6"] },
    { id: "col-done", title: "Done", cardIds: ["card-7", "card-8"] },
  ],
  cards: {
    "card-1": {
      id: "card-1",
      title: "Align roadmap themes",
      details: "Draft quarterly themes with impact statements and metrics.",
      workType: "product",
      effort: 3,
      priority: "high",
      assigneeRole: null,
      blocked: false,
      drawState: {
        lastDrawnAt: null,
      },
    },
    "card-2": {
      id: "card-2",
      title: "Gather customer signals",
      details: "Review support tags, sales notes, and churn feedback.",
      workType: "product",
      effort: 2,
      priority: "medium",
      assigneeRole: null,
      blocked: false,
      drawState: {
        lastDrawnAt: null,
      },
    },
    "card-3": {
      id: "card-3",
      title: "Prototype analytics view",
      details: "Sketch initial dashboard layout and key drill-downs.",
      workType: "design",
      effort: 3,
      priority: "medium",
      assigneeRole: null,
      blocked: false,
      drawState: {
        lastDrawnAt: null,
      },
    },
    "card-4": {
      id: "card-4",
      title: "Refine status language",
      details: "Standardize column labels and tone across the board.",
      workType: "product",
      effort: 1,
      priority: "medium",
      assigneeRole: null,
      blocked: false,
      drawState: {
        lastDrawnAt: null,
      },
    },
    "card-5": {
      id: "card-5",
      title: "Design card layout",
      details: "Add hierarchy and spacing for scanning dense lists.",
      workType: "design",
      effort: 2,
      priority: "medium",
      assigneeRole: null,
      blocked: false,
      drawState: {
        lastDrawnAt: null,
      },
    },
    "card-6": {
      id: "card-6",
      title: "QA micro-interactions",
      details: "Verify hover, focus, and loading states.",
      workType: "qa",
      effort: 1,
      priority: "low",
      assigneeRole: null,
      blocked: false,
      drawState: {
        lastDrawnAt: null,
      },
    },
    "card-7": {
      id: "card-7",
      title: "Ship marketing page",
      details: "Final copy approved and asset pack delivered.",
      workType: "ops",
      effort: 2,
      priority: "medium",
      assigneeRole: null,
      blocked: false,
      drawState: {
        lastDrawnAt: null,
      },
    },
    "card-8": {
      id: "card-8",
      title: "Close onboarding sprint",
      details: "Document release notes and share internally.",
      workType: "ops",
      effort: 1,
      priority: "low",
      assigneeRole: null,
      blocked: false,
      drawState: {
        lastDrawnAt: null,
      },
    },
  },
};

const VALID_VIEW_MODES: ViewMode[] = ["classic", "arcade"];
const VALID_WORK_TYPES: WorkType[] = ["product", "design", "code", "qa", "ops"];
const VALID_PRIORITIES: Priority[] = ["low", "medium", "high"];
const PRIORITY_WEIGHTS: Record<Priority, number> = {
  high: 30,
  medium: 20,
  low: 10,
};

const normalizeWorkType = (value: unknown): WorkType =>
  typeof value === "string" && VALID_WORK_TYPES.includes(value as WorkType)
    ? (value as WorkType)
    : "product";

const normalizePriority = (value: unknown): Priority =>
  typeof value === "string" && VALID_PRIORITIES.includes(value as Priority)
    ? (value as Priority)
    : "medium";

const normalizeEffort = (value: unknown): number | null =>
  typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5
    ? value
    : null;

const normalizeAssigneeRole = (value: unknown): WorkType | null =>
  typeof value === "string" && VALID_WORK_TYPES.includes(value as WorkType)
    ? (value as WorkType)
    : null;

const normalizeLastDrawnAt = (value: unknown): string | null => {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }

  return Number.isNaN(Date.parse(value)) ? null : value;
};

const normalizeBoolean = (value: unknown): boolean => value === true;

const normalizeRedrawCount = (value: unknown): number =>
  typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : 1;

export const getDefaultSourceColumnId = (columns: Column[]): string => {
  const backlogColumn =
    columns.find((column) => column.id === "col-backlog") ??
    columns.find((column) => column.title.trim().toLowerCase() === "backlog") ??
    columns[0];
  return backlogColumn?.id ?? "col-backlog";
};

export const getDefaultTargetColumnId = (
  columns: Column[],
  sourceColumnId: string
): string => {
  if (columns.length === 0) {
    return sourceColumnId;
  }

  const sourceIndex = columns.findIndex((column) => column.id === sourceColumnId);
  const nextColumn =
    (sourceIndex >= 0 ? columns[sourceIndex + 1] : null) ??
    columns.find((column) => column.id !== sourceColumnId) ??
    columns[0];

  return nextColumn?.id ?? sourceColumnId;
};

const normalizePlayerProfile = (value: unknown): PlayerProfile => ({
  primaryRole:
    typeof value === "object" && value !== null
      ? normalizeWorkType((value as { primaryRole?: unknown }).primaryRole)
      : "product",
});

const normalizeRunState = (value: unknown): RunState => ({
  redrawsRemaining:
    typeof value === "object" && value !== null
      ? normalizeRedrawCount((value as { redrawsRemaining?: unknown }).redrawsRemaining)
      : 1,
});

const normalizeDrawSettings = (value: unknown, columns: Column[]): DrawSettings => {
  const fallbackSourceColumnId = getDefaultSourceColumnId(columns);
  const fallbackTargetColumnId = getDefaultTargetColumnId(columns, fallbackSourceColumnId);

  if (typeof value !== "object" || value === null) {
    return {
      sourceColumnId: fallbackSourceColumnId,
      targetColumnId: fallbackTargetColumnId,
    };
  }

  const sourceColumnId =
    typeof (value as { sourceColumnId?: unknown }).sourceColumnId === "string" &&
    columns.some((column) => column.id === (value as { sourceColumnId?: string }).sourceColumnId)
      ? ((value as { sourceColumnId: string }).sourceColumnId)
      : fallbackSourceColumnId;

  const targetColumnId =
    typeof (value as { targetColumnId?: unknown }).targetColumnId === "string" &&
    columns.some((column) => column.id === (value as { targetColumnId?: string }).targetColumnId) &&
    (value as { targetColumnId: string }).targetColumnId !== sourceColumnId
      ? ((value as { targetColumnId: string }).targetColumnId)
      : getDefaultTargetColumnId(columns, sourceColumnId);

  return { sourceColumnId, targetColumnId };
};

export const normalizeBoardData = (board: Partial<BoardData> & {
  columns?: Column[];
  cards?: Record<string, Partial<Card>>;
  viewMode?: unknown;
  themeId?: unknown;
}): BoardData => {
  const columns = Array.isArray(board.columns) ? board.columns : initialData.columns;

  return {
    viewMode:
      typeof board.viewMode === "string" &&
      VALID_VIEW_MODES.includes(board.viewMode as ViewMode)
        ? (board.viewMode as ViewMode)
        : "classic",
    themeId: typeof board.themeId === "string" && board.themeId ? board.themeId : "core",
    playerProfile: normalizePlayerProfile(board.playerProfile),
    drawSettings: normalizeDrawSettings(board.drawSettings, columns),
    runState: normalizeRunState(board.runState),
    columns,
    cards: Object.fromEntries(
      Object.entries(board.cards ?? {}).map(([cardId, card]) => [
        cardId,
        {
          id: card?.id ?? cardId,
          title: typeof card?.title === "string" ? card.title : "Untitled card",
          details: typeof card?.details === "string" ? card.details : "",
          workType: normalizeWorkType(card?.workType),
          effort: normalizeEffort(card?.effort),
          priority: normalizePriority(card?.priority),
          assigneeRole: normalizeAssigneeRole(card?.assigneeRole),
          blocked: normalizeBoolean(card?.blocked),
          drawState:
            typeof card?.drawState === "object" && card.drawState !== null
              ? {
                  lastDrawnAt: normalizeLastDrawnAt(
                    (card.drawState as { lastDrawnAt?: unknown }).lastDrawnAt
                  ),
                }
              : { lastDrawnAt: null },
        },
      ])
    ),
  };
};

export const getCardRole = (card: Card): WorkType => card.assigneeRole ?? card.workType;

const getEffortWeight = (effort: number | null): number => {
  if (effort === null) {
    return 4;
  }
  if (effort <= 2) {
    return 10;
  }
  if (effort === 3) {
    return 8;
  }
  if (effort === 4) {
    return 4;
  }
  return 1;
};

const getRecencyPenalty = (lastDrawnAt: string | null, now = Date.now()): number => {
  if (!lastDrawnAt) {
    return 0;
  }

  const parsed = Date.parse(lastDrawnAt);
  if (Number.isNaN(parsed)) {
    return 0;
  }

  const ageHours = (now - parsed) / (1000 * 60 * 60);
  if (ageHours < 12) {
    return -12;
  }
  if (ageHours < 48) {
    return -6;
  }
  if (ageHours < 120) {
    return -2;
  }
  return 0;
};

export type DrawResult = {
  cardId: string;
  sourceColumnId: string;
  targetColumnId: string;
  whyThisDraw: string;
};

const buildWhyThisDraw = (card: Card, role: WorkType): string => {
  const reasons = [`matches your ${role} role`];
  if (card.priority === "high") {
    reasons.push("carries high priority");
  }
  if (card.effort !== null && card.effort <= 3) {
    reasons.push("fits the current run cost");
  }
  if (!card.blocked) {
    reasons.push("is ready to move now");
  }
  return `Drawn because it ${reasons.join(" and ")}.`;
};

export const drawCardForBoard = (
  board: BoardData,
  options?: {
    excludedCardIds?: string[];
    now?: string;
    randomValue?: number;
  }
): DrawResult | null => {
  const sourceColumn = board.columns.find(
    (column) => column.id === board.drawSettings.sourceColumnId
  );

  if (!sourceColumn) {
    return null;
  }

  const excludedCardIds = new Set(options?.excludedCardIds ?? []);
  const role = board.playerProfile.primaryRole;
  const now = options?.now ? Date.parse(options.now) : Date.now();
  const eligible = sourceColumn.cardIds
    .map((cardId) => board.cards[cardId])
    .filter(
      (card): card is Card =>
        Boolean(card) &&
        !excludedCardIds.has(card.id) &&
        !card.blocked &&
        getCardRole(card) === role
    )
    .map((card) => ({
      card,
      score:
        40 +
        PRIORITY_WEIGHTS[card.priority] +
        getEffortWeight(card.effort) +
        getRecencyPenalty(card.drawState.lastDrawnAt, now),
    }))
    .sort((left, right) => right.score - left.score);

  if (eligible.length === 0) {
    return null;
  }

  const topCandidates = eligible
    .filter((candidate) => candidate.score >= eligible[0].score - 4)
    .slice(0, 3);
  const minScore = Math.min(...topCandidates.map((candidate) => candidate.score));
  const totalWeight = topCandidates.reduce(
    (sum, candidate) => sum + (candidate.score - minScore + 1),
    0
  );
  const randomValue = options?.randomValue ?? Math.random();
  let cursor = randomValue * totalWeight;
  let chosenCandidate = topCandidates[0];

  for (const candidate of topCandidates) {
    cursor -= candidate.score - minScore + 1;
    if (cursor <= 0) {
      chosenCandidate = candidate;
      break;
    }
  }

  return {
    cardId: chosenCandidate.card.id,
    sourceColumnId: sourceColumn.id,
    targetColumnId: board.drawSettings.targetColumnId,
    whyThisDraw: buildWhyThisDraw(chosenCandidate.card, role),
  };
};

export const acceptDrawCard = (
  board: BoardData,
  cardId: string,
  now = new Date().toISOString()
): BoardData => ({
  ...board,
  columns: moveCard(board.columns, cardId, board.drawSettings.targetColumnId),
  cards: {
    ...board.cards,
    [cardId]: {
      ...board.cards[cardId],
      drawState: {
        lastDrawnAt: now,
      },
    },
  },
});

export const consumeRedraw = (board: BoardData): BoardData => ({
  ...board,
  runState: {
    ...board.runState,
    redrawsRemaining: Math.max(0, board.runState.redrawsRemaining - 1),
  },
});

const isColumnId = (columns: Column[], id: string) =>
  columns.some((column) => column.id === id);

const findColumnId = (columns: Column[], id: string) => {
  if (isColumnId(columns, id)) {
    return id;
  }
  return columns.find((column) => column.cardIds.includes(id))?.id;
};

export const moveCard = (
  columns: Column[],
  activeId: string,
  overId: string
): Column[] => {
  const activeColumnId = findColumnId(columns, activeId);
  const overColumnId = findColumnId(columns, overId);

  if (!activeColumnId || !overColumnId) {
    return columns;
  }

  const activeColumn = columns.find((column) => column.id === activeColumnId);
  const overColumn = columns.find((column) => column.id === overColumnId);

  if (!activeColumn || !overColumn) {
    return columns;
  }

  const isOverColumn = isColumnId(columns, overId);

  if (activeColumnId === overColumnId) {
    if (isOverColumn) {
      const nextCardIds = activeColumn.cardIds.filter(
        (cardId) => cardId !== activeId
      );
      nextCardIds.push(activeId);
      return columns.map((column) =>
        column.id === activeColumnId
          ? { ...column, cardIds: nextCardIds }
          : column
      );
    }

    const oldIndex = activeColumn.cardIds.indexOf(activeId);
    const newIndex = activeColumn.cardIds.indexOf(overId);

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      return columns;
    }

    const nextCardIds = [...activeColumn.cardIds];
    nextCardIds.splice(oldIndex, 1);
    nextCardIds.splice(newIndex, 0, activeId);

    return columns.map((column) =>
      column.id === activeColumnId
        ? { ...column, cardIds: nextCardIds }
        : column
    );
  }

  const activeIndex = activeColumn.cardIds.indexOf(activeId);
  if (activeIndex === -1) {
    return columns;
  }

  const nextActiveCardIds = [...activeColumn.cardIds];
  nextActiveCardIds.splice(activeIndex, 1);

  const nextOverCardIds = [...overColumn.cardIds];
  if (isOverColumn) {
    nextOverCardIds.push(activeId);
  } else {
    const overIndex = overColumn.cardIds.indexOf(overId);
    const insertIndex = overIndex === -1 ? nextOverCardIds.length : overIndex;
    nextOverCardIds.splice(insertIndex, 0, activeId);
  }

  return columns.map((column) => {
    if (column.id === activeColumnId) {
      return { ...column, cardIds: nextActiveCardIds };
    }
    if (column.id === overColumnId) {
      return { ...column, cardIds: nextOverCardIds };
    }
    return column;
  });
};

export const createId = (prefix: string) => {
  const randomPart = Math.random().toString(36).slice(2, 8);
  const timePart = Date.now().toString(36);
  return `${prefix}-${randomPart}${timePart}`;
};
