import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProgressMarkers } from "./progress-markers";

describe("ProgressMarkers", () => {
  it("renders one button per step and marks the current one", () => {
    render(
      <ProgressMarkers
        total={3}
        index={1}
        onSelect={() => {}}
        label="Go to concept {n}"
      />
    );
    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(
      screen.getByRole("button", { name: "Go to concept 2" })
    ).toHaveAttribute("aria-current", "true");
    expect(
      screen.getByRole("button", { name: "Go to concept 1" })
    ).toHaveAttribute("aria-current", "false");
  });

  it("draws only the current marker solid, and never a tick", () => {
    const { container } = render(
      <ProgressMarkers
        total={3}
        index={2}
        onSelect={() => {}}
        label="Go to concept {n}"
      />
    );
    const paths = container.querySelectorAll("svg path");
    // One path per marker: no check mark.
    expect(paths).toHaveLength(3);
    expect(Array.from(paths).map((path) => path.getAttribute("fill"))).toEqual([
      "none",
      "none",
      "currentColor",
    ]);
  });

  it("reports which step was chosen", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ProgressMarkers
        total={3}
        index={0}
        onSelect={onSelect}
        label="Go to concept {n}"
      />
    );
    await user.click(screen.getByRole("button", { name: "Go to concept 3" }));
    expect(onSelect).toHaveBeenCalledWith(2);
  });
});
