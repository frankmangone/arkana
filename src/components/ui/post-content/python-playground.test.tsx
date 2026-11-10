import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Post } from "@/lib/types";
import { PostContent } from "./index";

vi.mock("@/lib/posts/translations", () => ({
  getHiddenPostKeys: async () => new Set<string>(),
}));

async function render(content: string): Promise<string> {
  const post = { content, metadata: { visible: true } } as unknown as Post;
  return renderToStaticMarkup(await PostContent({ post }));
}

describe("runnable python blocks", () => {
  it("renders a ```python run block as an editable playground", async () => {
    const html = await render(
      "```python run\nimport numpy as np\nprint(np.pi)\n```"
    );
    expect(html).toContain("<textarea");
    expect(html).toContain("Python");
    // The original source, untouched by syntax highlighting, is the editor value.
    expect(html).toContain(">import numpy as np\nprint(np.pi)</textarea>");
  });

  it("leaves plain python blocks as static highlighted code", async () => {
    const html = await render("```python\nprint('hi')\n```");
    expect(html).not.toContain("<textarea");
    expect(html).toContain("code-highlight");
  });

  it("only treats `run` as a standalone word in the info string", async () => {
    const html = await render("```python runner\nprint('hi')\n```");
    expect(html).not.toContain("<textarea");
  });
});
