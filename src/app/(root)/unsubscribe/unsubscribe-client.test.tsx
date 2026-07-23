import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

vi.mock("@/lib/hooks/use-dictionary", () => ({
  useDictionary: () => null,
}));

const unsubscribeMutateAsync = vi.fn();
vi.mock("@/lib/api/hooks/useSubscriptions", () => ({
  useUnsubscribeByToken: () => ({ mutateAsync: unsubscribeMutateAsync }),
}));

import { UnsubscribeClient } from "./unsubscribe-client";

describe("UnsubscribeClient", () => {
  beforeEach(() => {
    unsubscribeMutateAsync.mockReset();
    mockSearchParams.delete("sid");
    mockSearchParams.delete("token");
  });

  it("shows a loading state, then success", async () => {
    mockSearchParams.set("sid", "7");
    mockSearchParams.set("token", "valid-token");
    unsubscribeMutateAsync.mockResolvedValue({ unsubscribed: true });

    render(<UnsubscribeClient />);

    expect(screen.getByText("Unsubscribing...")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText("You've been unsubscribed.")
      ).toBeInTheDocument();
    });
    expect(unsubscribeMutateAsync).toHaveBeenCalledWith({
      subscriberId: 7,
      token: "valid-token",
    });
  });

  it("shows a loading state, then an error on an invalid link", async () => {
    mockSearchParams.set("sid", "7");
    mockSearchParams.set("token", "bad-token");
    unsubscribeMutateAsync.mockRejectedValue(new Error("invalid or expired"));

    render(<UnsubscribeClient />);

    await waitFor(() => {
      expect(
        screen.getByText("This link is invalid or expired.")
      ).toBeInTheDocument();
    });
  });

  it("shows an error immediately when sid or token is missing", async () => {
    render(<UnsubscribeClient />);

    await waitFor(() => {
      expect(
        screen.getByText("This link is invalid or expired.")
      ).toBeInTheDocument();
    });
    expect(unsubscribeMutateAsync).not.toHaveBeenCalled();
  });
});
