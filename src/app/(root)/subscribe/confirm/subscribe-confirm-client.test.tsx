import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

vi.mock("@/lib/hooks/use-dictionary", () => ({
  useDictionary: () => null,
}));

const confirmMutateAsync = vi.fn();
vi.mock("@/lib/api/hooks/useSubscriptions", () => ({
  useConfirmSubscription: () => ({ mutateAsync: confirmMutateAsync }),
}));

import { SubscribeConfirmClient } from "./subscribe-confirm-client";

describe("SubscribeConfirmClient", () => {
  beforeEach(() => {
    confirmMutateAsync.mockReset();
    mockSearchParams.delete("sid");
    mockSearchParams.delete("token");
  });

  it("shows a loading state, then success", async () => {
    mockSearchParams.set("sid", "42");
    mockSearchParams.set("token", "valid-token");
    confirmMutateAsync.mockResolvedValue({ confirmed: true });

    render(<SubscribeConfirmClient />);

    expect(
      screen.getByText("Confirming your subscription...")
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("You're subscribed!")).toBeInTheDocument();
    });
    expect(confirmMutateAsync).toHaveBeenCalledWith({
      subscriberId: 42,
      token: "valid-token",
    });
  });

  it("shows a loading state, then an error on an invalid link", async () => {
    mockSearchParams.set("sid", "42");
    mockSearchParams.set("token", "bad-token");
    confirmMutateAsync.mockRejectedValue(new Error("invalid or expired"));

    render(<SubscribeConfirmClient />);

    await waitFor(() => {
      expect(
        screen.getByText("This link is invalid or expired.")
      ).toBeInTheDocument();
    });
  });

  it("shows an error immediately when sid or token is missing", async () => {
    render(<SubscribeConfirmClient />);

    await waitFor(() => {
      expect(
        screen.getByText("This link is invalid or expired.")
      ).toBeInTheDocument();
    });
    expect(confirmMutateAsync).not.toHaveBeenCalled();
  });
});
