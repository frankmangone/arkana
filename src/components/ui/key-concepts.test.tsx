import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KeyConcepts, type KeyConceptsDictionary } from "./key-concepts";

// The track slides to the chosen card with an animation. Resolve it at once so
// the tests don't wait on animation frames.
vi.mock("motion/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("motion/react")>()),
  animate: vi.fn(() => Promise.resolve()),
}));

const dictionary: KeyConceptsDictionary = {
  title: "Key concepts",
  previous: "Previous concept",
  next: "Next concept",
  goTo: "Go to concept {n}",
  position: "{current} of {total}",
};

const cards = ["Alpha", "Beta", "Gamma"].map((name) => (
  <div key={name}>
    <h4>{name}</h4>
    <p>
      About <a href="https://example.com">{name} link</a>
    </p>
  </div>
));

// The deck is rendered three times over, so it can loop; only the front card
// is exposed (not aria-hidden).
const frontHeading = (container: HTMLElement) =>
  container.querySelector('[data-front="true"] h4')?.textContent;

describe("KeyConcepts", () => {
  it("shows the first card and its position as N / M", () => {
    const { container } = render(
      <KeyConcepts cards={cards} dictionary={dictionary} />
    );
    expect(frontHeading(container)).toBe("Alpha");
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    // Screen readers get the translated wording.
    expect(screen.getByText("1 of 3")).toBeInTheDocument();
  });

  it("cycles forward and wraps around with the next button", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <KeyConcepts cards={cards} dictionary={dictionary} />
    );
    const next = screen.getByRole("button", { name: "Next concept" });

    await user.click(next);
    expect(await screen.findByText("2 / 3")).toBeInTheDocument();
    expect(frontHeading(container)).toBe("Beta");
    await user.click(next);
    expect(await screen.findByText("3 / 3")).toBeInTheDocument();
    await user.click(next);
    expect(await screen.findByText("1 / 3")).toBeInTheDocument();
  });

  it("goes backwards, wrapping to the last card", async () => {
    const user = userEvent.setup();
    render(<KeyConcepts cards={cards} dictionary={dictionary} />);
    await user.click(screen.getByRole("button", { name: "Previous concept" }));
    expect(await screen.findByText("3 / 3")).toBeInTheDocument();
  });

  it("jumps with the dots", async () => {
    const user = userEvent.setup();
    render(<KeyConcepts cards={cards} dictionary={dictionary} />);
    await user.click(screen.getByRole("button", { name: "Go to concept 3" }));
    expect(await screen.findByText("3 / 3")).toBeInTheDocument();
  });

  it("responds to arrow keys when focused", async () => {
    const user = userEvent.setup();
    render(<KeyConcepts cards={cards} dictionary={dictionary} />);
    screen.getByRole("region", { name: "Key concepts" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(await screen.findByText("2 / 3")).toBeInTheDocument();
    await user.keyboard("{ArrowLeft}");
    expect(await screen.findByText("1 / 3")).toBeInTheDocument();
    await user.keyboard("{ArrowLeft}");
    expect(await screen.findByText("3 / 3")).toBeInTheDocument();
  });

  it("keeps the cards behind the front one out of the accessibility tree and focus order", () => {
    const { container } = render(
      <KeyConcepts cards={cards} dictionary={dictionary} />
    );
    const behind = container.querySelectorAll('[aria-hidden="true"][inert]');
    // 3 cards in 3 copies, all but the front one.
    expect(behind).toHaveLength(8);
  });

  it("hides the controls for a single card", () => {
    render(<KeyConcepts cards={cards.slice(0, 1)} dictionary={dictionary} />);
    expect(
      screen.queryByRole("button", { name: "Next concept" })
    ).not.toBeInTheDocument();
    expect(screen.queryByText("1 / 1")).not.toBeInTheDocument();
  });
});
