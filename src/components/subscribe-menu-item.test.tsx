import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DropdownMenu,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

vi.mock("next/navigation", () => ({
  useParams: () => ({}),
}));

vi.mock("@/lib/hooks/use-dictionary", () => ({
  useDictionary: () => null,
}));

const mockUseAuth = vi.fn();
vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => mockUseAuth(),
}));

const mockUseSubscriptionStatus = vi.fn();
const subscribeMutateAsync = vi.fn();
const unsubscribeMutateAsync = vi.fn();
vi.mock("@/lib/api/hooks/useSubscriptions", () => ({
  useSubscriptionStatus: (enabled: boolean) =>
    mockUseSubscriptionStatus(enabled),
  useSubscribeAuthenticated: () => ({
    mutateAsync: subscribeMutateAsync,
    isPending: false,
  }),
  useUnsubscribeAuthenticated: () => ({
    mutateAsync: unsubscribeMutateAsync,
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

import { SubscribeMenuItem } from "./subscribe-menu-item";

function renderMenuItem() {
  return render(
    <DropdownMenu open>
      <DropdownMenuContent>
        <SubscribeMenuItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe("SubscribeMenuItem", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockUseSubscriptionStatus.mockReset();
    subscribeMutateAsync.mockReset();
    unsubscribeMutateAsync.mockReset();
    toastError.mockReset();
    toastSuccess.mockReset();
  });

  it("renders nothing when logged out", () => {
    mockUseAuth.mockReturnValue({ user: null });
    mockUseSubscriptionStatus.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });

    renderMenuItem();

    expect(
      screen.queryByText("Subscribe to newsletter")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Unsubscribe from newsletter")
    ).not.toBeInTheDocument();
  });

  it("renders nothing while the status query is loading", () => {
    mockUseAuth.mockReturnValue({ user: { id: 1 } });
    mockUseSubscriptionStatus.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    renderMenuItem();

    expect(
      screen.queryByText("Subscribe to newsletter")
    ).not.toBeInTheDocument();
  });

  it("renders nothing when the status query errors", () => {
    mockUseAuth.mockReturnValue({ user: { id: 1 } });
    mockUseSubscriptionStatus.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    renderMenuItem();

    expect(
      screen.queryByText("Subscribe to newsletter")
    ).not.toBeInTheDocument();
  });

  it("shows 'Subscribe to newsletter' when not subscribed; clicking subscribes and toasts", async () => {
    mockUseAuth.mockReturnValue({ user: { id: 1 } });
    mockUseSubscriptionStatus.mockReturnValue({
      data: { subscribed: false },
      isLoading: false,
      isError: false,
    });
    subscribeMutateAsync.mockResolvedValue({ subscribed: true });

    renderMenuItem();
    const user = userEvent.setup();

    await user.click(screen.getByText("Subscribe to newsletter"));

    await waitFor(() => {
      expect(subscribeMutateAsync).toHaveBeenCalled();
    });
    expect(toastSuccess).toHaveBeenCalledWith("You're subscribed!");
  });

  it("shows 'Unsubscribe from newsletter' when subscribed; clicking unsubscribes and toasts", async () => {
    mockUseAuth.mockReturnValue({ user: { id: 1 } });
    mockUseSubscriptionStatus.mockReturnValue({
      data: { subscribed: true },
      isLoading: false,
      isError: false,
    });
    unsubscribeMutateAsync.mockResolvedValue({ subscribed: false });

    renderMenuItem();
    const user = userEvent.setup();

    await user.click(screen.getByText("Unsubscribe from newsletter"));

    await waitFor(() => {
      expect(unsubscribeMutateAsync).toHaveBeenCalled();
    });
    expect(toastSuccess).toHaveBeenCalledWith("You've been unsubscribed.");
  });

  it("shows an error toast when the subscribe mutation fails", async () => {
    mockUseAuth.mockReturnValue({ user: { id: 1 } });
    mockUseSubscriptionStatus.mockReturnValue({
      data: { subscribed: false },
      isLoading: false,
      isError: false,
    });
    subscribeMutateAsync.mockRejectedValue(new Error("network error"));

    renderMenuItem();
    const user = userEvent.setup();

    await user.click(screen.getByText("Subscribe to newsletter"));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        "Something went wrong. Please try again."
      );
    });
  });

  it("shows an error toast when the unsubscribe mutation fails", async () => {
    mockUseAuth.mockReturnValue({ user: { id: 1 } });
    mockUseSubscriptionStatus.mockReturnValue({
      data: { subscribed: true },
      isLoading: false,
      isError: false,
    });
    unsubscribeMutateAsync.mockRejectedValue(new Error("network error"));

    renderMenuItem();
    const user = userEvent.setup();

    await user.click(screen.getByText("Unsubscribe from newsletter"));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        "Something went wrong. Please try again."
      );
    });
  });
});
