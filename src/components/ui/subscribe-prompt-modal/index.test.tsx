import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockUseSubscribeModalEligibility = vi.fn();
vi.mock("@/lib/hooks/use-subscribe-modal-eligibility", () => ({
  useSubscribeModalEligibility: () => mockUseSubscribeModalEligibility(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({}),
}));

vi.mock("@/lib/hooks/use-dictionary", () => ({
  useDictionary: () => null,
}));

const guestMutateAsync = vi.fn();
const authenticatedMutateAsync = vi.fn();
vi.mock("@/lib/api/hooks/useSubscriptions", () => ({
  useSubscribeGuest: () => ({
    mutateAsync: guestMutateAsync,
    isPending: false,
  }),
  useSubscribeAuthenticated: () => ({
    mutateAsync: authenticatedMutateAsync,
    isPending: false,
  }),
}));

const toastError = vi.fn();
const toastSuccess = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => toastError(...args),
    success: (...args: unknown[]) => toastSuccess(...args),
  },
}));

import { SubscribePromptModal } from "./index";

describe("SubscribePromptModal", () => {
  beforeEach(() => {
    guestMutateAsync.mockReset();
    authenticatedMutateAsync.mockReset();
    toastError.mockReset();
    toastSuccess.mockReset();
    mockUseSubscribeModalEligibility.mockReset();
  });

  it("renders nothing when ineligible", () => {
    mockUseSubscribeModalEligibility.mockReturnValue({
      isEligible: false,
      isLoggedIn: false,
      markShown: vi.fn(),
      markGuestSubscribed: vi.fn(),
    });

    render(<SubscribePromptModal />);

    expect(screen.queryByText("Never miss a post")).not.toBeInTheDocument();
  });

  it("guest form success swaps to the check-your-email view", async () => {
    const markGuestSubscribed = vi.fn();
    mockUseSubscribeModalEligibility.mockReturnValue({
      isEligible: true,
      isLoggedIn: false,
      markShown: vi.fn(),
      markGuestSubscribed,
    });
    guestMutateAsync.mockResolvedValue({ status: "pending" });

    render(<SubscribePromptModal />);
    const user = userEvent.setup();

    const input = await screen.findByPlaceholderText("you@example.com");
    await user.type(input, "guest@example.com");
    await user.click(screen.getByRole("button", { name: "Subscribe" }));

    await waitFor(() => {
      expect(screen.getByText("Check your email")).toBeInTheDocument();
    });
    expect(guestMutateAsync).toHaveBeenCalledWith("guest@example.com");
    expect(markGuestSubscribed).toHaveBeenCalled();
  });

  it("logged-in subscribe success closes the modal and toasts", async () => {
    mockUseSubscribeModalEligibility.mockReturnValue({
      isEligible: true,
      isLoggedIn: true,
      markShown: vi.fn(),
      markGuestSubscribed: vi.fn(),
    });
    authenticatedMutateAsync.mockResolvedValue({ subscribed: true });

    render(<SubscribePromptModal />);
    const user = userEvent.setup();

    const button = await screen.findByRole("button", { name: "Subscribe" });
    await user.click(button);

    await waitFor(() => {
      expect(screen.queryByText("Never miss a post")).not.toBeInTheDocument();
    });
    expect(toastSuccess).toHaveBeenCalledWith("You're subscribed!");
  });

  it("shows an error toast and stays open when the guest mutation fails", async () => {
    mockUseSubscribeModalEligibility.mockReturnValue({
      isEligible: true,
      isLoggedIn: false,
      markShown: vi.fn(),
      markGuestSubscribed: vi.fn(),
    });
    guestMutateAsync.mockRejectedValue(new Error("network error"));

    render(<SubscribePromptModal />);
    const user = userEvent.setup();

    const input = await screen.findByPlaceholderText("you@example.com");
    await user.type(input, "guest@example.com");
    await user.click(screen.getByRole("button", { name: "Subscribe" }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        "Something went wrong. Please try again."
      );
    });
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
  });
});
