interface MdNode {
  type: string;
  lang?: string | null;
  meta?: string | null;
  value?: string;
  data?: Record<string, unknown>;
  children?: MdNode[];
}

/**
 * Marks fenced code blocks written as ```python run so the `pre` override can
 * render them as an interactive playground instead of a static block.
 *
 * The raw source travels as a data attribute on the <code> element: by the
 * time rehype-prism-plus has run, the element's children are highlighted
 * token spans, not the original text.
 *
 * Authoring: in Obsidian and anywhere else that ignores the info string's
 * extra words, the block stays an ordinary python code block.
 */
export function remarkPlayground() {
  const visit = (node: MdNode) => {
    if (
      node.type === "code" &&
      node.lang === "python" &&
      /(^|\s)run(\s|$)/.test(node.meta ?? "")
    ) {
      node.data = {
        ...node.data,
        hProperties: {
          "data-playground": "python",
          "data-source": node.value ?? "",
        },
      };
    }
    node.children?.forEach(visit);
  };
  return visit;
}
