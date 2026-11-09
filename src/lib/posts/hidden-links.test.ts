import { describe, expect, it } from "vitest";
import { hiddenPostKey, isHiddenPostHref } from "./hidden-links";

const hidden = new Set([hiddenPostKey("en", "drafts-series", "secret")]);

describe("isHiddenPostHref", () => {
  it("matches an internal link to a hidden post", () => {
    expect(isHiddenPostHref("/en/blog/drafts-series/secret", hidden)).toBe(
      true
    );
  });

  it("ignores anchors, query strings and trailing slashes", () => {
    expect(
      isHiddenPostHref("/en/blog/drafts-series/secret#some-heading", hidden)
    ).toBe(true);
    expect(isHiddenPostHref("/en/blog/drafts-series/secret?x=1", hidden)).toBe(
      true
    );
    expect(isHiddenPostHref("/en/blog/drafts-series/secret/", hidden)).toBe(
      true
    );
  });

  it("does not match a visible post", () => {
    expect(isHiddenPostHref("/en/blog/drafts-series/public", hidden)).toBe(
      false
    );
  });

  it("is language-specific", () => {
    expect(isHiddenPostHref("/es/blog/drafts-series/secret", hidden)).toBe(
      false
    );
  });

  it("does not match external or non-post links", () => {
    expect(isHiddenPostHref("https://example.com/en/blog/a/secret", hidden)).toBe(
      false
    );
    expect(isHiddenPostHref("/en/blog", hidden)).toBe(false);
    expect(isHiddenPostHref("#section", hidden)).toBe(false);
    expect(isHiddenPostHref(undefined, hidden)).toBe(false);
  });
});
