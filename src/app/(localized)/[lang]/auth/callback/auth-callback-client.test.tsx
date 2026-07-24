import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  useParams: () => ({ lang: "en" }),
}));

const mockMutateAsync = vi.fn();
vi.mock("@/lib/api", () => ({
  useGoogleAuth: () => ({ mutateAsync: mockMutateAsync }),
}));

vi.mock("@/lib/auth/google-oauth", () => ({
  extractOAuthCode: () => ({ code: "abc123" }),
}));

const mockUseQueryClient = vi.fn();
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return { ...actual, useQueryClient: () => mockUseQueryClient() };
});

const mockResumePendingIntent = vi.fn();
vi.mock("@/lib/auth/pending-intent", () => ({
  resumePendingIntent: (...args: unknown[]) => mockResumePendingIntent(...args),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { AuthCallbackClient } from "./auth-callback-client";

describe("AuthCallbackClient", () => {
  beforeEach(() => {
    mockMutateAsync.mockResolvedValue(undefined);
    mockUseQueryClient.mockReturnValue({});
    mockResumePendingIntent.mockResolvedValue("/en/blog/my-post");
    mockPush.mockReset();
  });

  it("navigates to the path returned by resumePendingIntent instead of hardcoding home", async () => {
    render(<AuthCallbackClient />);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/en/blog/my-post"));
    expect(mockResumePendingIntent).toHaveBeenCalledWith(expect.anything(), "/en");
  });
});
