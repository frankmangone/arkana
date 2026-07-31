import { describe, it, expect, beforeEach } from "vitest";
import { setPendingIntent, consumePendingIntent } from "./pending-intent";
import { PendingActionType } from "./pending-action-types";

const NOW = new Date("2026-07-24T12:00:00.000Z").getTime();
const STORAGE_KEY = "arkana_pending_intent";

describe("pending-intent storage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("round-trips a plain returnTo with no action", () => {
    setPendingIntent({ returnTo: "/en/blog/my-post" }, NOW);
    expect(consumePendingIntent(NOW)).toEqual({
      returnTo: "/en/blog/my-post",
      action: undefined,
      createdAt: NOW,
    });
  });

  it("round-trips an intent with an action", () => {
    setPendingIntent(
      {
        returnTo: "/en/blog/my-post",
        action: { type: PendingActionType.Like, payload: { path: "blog/my-post" } },
      },
      NOW
    );
    expect(consumePendingIntent(NOW)).toEqual({
      returnTo: "/en/blog/my-post",
      action: { type: PendingActionType.Like, payload: { path: "blog/my-post" } },
      createdAt: NOW,
    });
  });

  it("clears the key on read - a second consume returns null", () => {
    setPendingIntent({ returnTo: "/en" }, NOW);
    consumePendingIntent(NOW);
    expect(consumePendingIntent(NOW)).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("returns null when nothing was stored", () => {
    expect(consumePendingIntent(NOW)).toBeNull();
  });

  it("returns null and clears the key on malformed JSON", () => {
    sessionStorage.setItem(STORAGE_KEY, "{not json");
    expect(consumePendingIntent(NOW)).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("returns the intent when read exactly at the 10-minute TTL boundary", () => {
    setPendingIntent({ returnTo: "/en" }, NOW);
    const tenMinutesLater = NOW + 10 * 60 * 1000;
    expect(consumePendingIntent(tenMinutesLater)).not.toBeNull();
  });

  it("returns null when read just past the 10-minute TTL boundary", () => {
    setPendingIntent({ returnTo: "/en" }, NOW);
    const justPast = NOW + 10 * 60 * 1000 + 1;
    expect(consumePendingIntent(justPast)).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
