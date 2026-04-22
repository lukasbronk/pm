import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "@/components/AppShell";

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
        json: async () => ({ authenticated: false, username: null }),
      });

    render(<AppShell />);

    await userEvent.click(await screen.findByRole("button", { name: "Log Out" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
    });
  });
});
