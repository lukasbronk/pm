import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "@/components/AppShell";
import { initialData } from "@/lib/kanban";

const fetchMock = vi.fn();

describe("AppShell", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the login form when there is no session", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ authenticated: false, username: null }),
    });

    render(<AppShell />);

    expect(await screen.findByRole("heading", { name: "Kanban Studio" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("logs in and shows the board", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ authenticated: false, username: null }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ authenticated: true, username: "user" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => initialData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: [] }),
      });

    render(<AppShell />);

    await userEvent.click(await screen.findByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Signed In")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log Out" })).toBeInTheDocument();
  });

  it("logs out back to the login form", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ authenticated: true, username: "user" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => initialData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ authenticated: false, username: null }),
      });

    render(<AppShell />);

    await userEvent.click(await screen.findByRole("button", { name: "Log Out" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
    });
  });

  it("loads the board from the backend session", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ authenticated: true, username: "user" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...initialData,
          columns: initialData.columns.map((column, index) =>
            index === 0 ? { ...column, title: "Ready" } : column
          ),
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: [] }),
      });

    render(<AppShell />);

    expect(await screen.findByText("Ready")).toBeInTheDocument();
  });

  it("sends an AI message and updates the board", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ authenticated: true, username: "user" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => initialData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reply: "Added the card.",
          board: {
            ...initialData,
            cards: {
              ...initialData.cards,
              "card-new": {
                id: "card-new",
                title: "Review budget",
                details: "Check Q3 numbers.",
              },
            },
            columns: initialData.columns.map((column, index) =>
              index === 0
                ? { ...column, cardIds: [...column.cardIds, "card-new"] }
                : column
            ),
          },
        }),
      });

    render(<AppShell />);

    await userEvent.click(await screen.findByRole("button", { name: "AI Helper" }));
    await userEvent.type(
      await screen.findByPlaceholderText(/ask the ai to update cards/i),
      "Add a card"
    );
    await userEvent.click(screen.getByRole("button", { name: "Send To AI" }));

    expect(await screen.findByText("Added the card.")).toBeInTheDocument();
    expect(screen.getByText("Review budget")).toBeInTheDocument();
  });

  it("shows an AI thinking state while waiting for the response", async () => {
    let resolveChat: ((value: { ok: boolean; json: () => Promise<{ reply: string; board: typeof initialData }> }) => void) | null = null;

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ authenticated: true, username: "user" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => initialData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: [] }),
      })
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveChat = resolve;
          })
      );

    render(<AppShell />);

    await userEvent.click(await screen.findByRole("button", { name: "AI Helper" }));
    await userEvent.type(
      await screen.findByPlaceholderText(/ask the ai to update cards/i),
      "Add a card"
    );
    await userEvent.click(screen.getByRole("button", { name: "Send To AI" }));

    expect(await screen.findByText("Thinking...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Thinking" })).toBeDisabled();

    resolveChat?.({
      ok: true,
      json: async () => ({
        reply: "Done.",
        board: initialData,
      }),
    });

    expect(await screen.findByText("Done.")).toBeInTheDocument();
  });
});
