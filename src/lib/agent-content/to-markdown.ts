import matter from "gray-matter";
import { splitKeyConcepts } from "@/components/ui/post-content/validate-key-concepts";
import { isHiddenPostHref } from "@/lib/posts/hidden-links";
import { SITE_URL } from "@/lib/site-config";
import type { PostMetadata } from "@/lib/types";
import { deckToMarkdown } from "./key-concepts-markdown";
import { postUrl } from "./urls";

export interface AgentMarkdownInput {
  /** The post's markdown, without frontmatter. */
  content: string;
  metadata: PostMetadata;
  lang: string;
  folder: string;
  slug: string;
  authorName: string;
  /** Posts (see hiddenPostKey) that links must not point to. */
  hiddenPostKeys: ReadonlySet<string>;
  /** Heading for the key-concepts section (translated). */
  keyConceptsHeading: string;
}

// Fenced blocks and inline code, which must come through untouched.
const CODE = /^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[^\n]*$|`[^`\n]+`/gm;

function mapOutsideCode(
  text: string,
  transform: (segment: string) => string
): string {
  let result = "";
  let last = 0;
  for (const match of text.matchAll(CODE)) {
    result += transform(text.slice(last, match.index));
    // ```python run`` is the site's runnable playground; to a reader it's
    // just a python block.
    result += match[0].replace(
      /^(`{3,}|~{3,})python[ \t]+run[^\n]*/,
      "$1python"
    );
    last = match.index + match[0].length;
  }
  return result + transform(text.slice(last));
}

const kebab = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const escapeAttribute = (value: string) => value.replace(/"/g, "&quot;");

const blockquote = (text: string) =>
  "\n\n" +
  text
    .trim()
    .split("\n")
    .map((line) => (line.trim() ? `> ${line}` : ">"))
    .join("\n") +
  "\n\n";

/**
 * Obsidian wikilinks, `[[content/{lang}/{series}/{slug}#Heading|text]]`, as
 * plain site links. Mirrors arkana-content/scripts/wikilinks-to-links.jq, which
 * the publish workflow applies; this only matters for unpublished local content.
 */
function convertWikilinks(text: string): string {
  return text.replace(/(?<!!)\[\[([^\]]+)\]\]/g, (whole, inner: string) => {
    const match = inner.match(/^([^#|]+)(?:#([^|]+))?(?:\|(.+))?$/);
    const [, target, heading, label] = match ?? [];
    const [, lang, series, slug] = target?.split("/") ?? [];
    if (!lang || !series || !slug) return whole;
    const href = `/${lang}/blog/${series}/${slug}${heading ? `#${kebab(heading)}` : ""}`;
    return `[${label ?? heading ?? slug}](${href})`;
  });
}

/**
 * A post as markdown for agents: the article text with the site's special
 * constructs replaced by plain-markdown equivalents, links and images made
 * absolute, and links to hidden posts dropped. Math and code are untouched.
 */
export function toAgentMarkdown(input: AgentMarkdownInput): string {
  const { metadata, lang, folder, slug, hiddenPostKeys } = input;
  const pageUrl = postUrl(lang, folder, slug);
  const absolute = (href: string) =>
    href.startsWith("/") && !href.startsWith("//")
      ? `${SITE_URL}${href}`
      : href;

  // The deck is shown in a modal on the site; here it's a section at the end.
  // Throws, like the page does, if the deck isn't the post's last block.
  const { body, deck } = splitKeyConcepts(input.content, metadata.title);
  const deckMarkdown = deck
    ? deckToMarkdown(deck, input.keyConceptsHeading)
    : "";
  const source = convertWikilinks(
    deckMarkdown ? `${body}\n\n${deckMarkdown}` : body
  );

  const text = mapOutsideCode(source, (segment) =>
    segment
      // Custom blocks
      .replace(/:::\s*big-quote\s*([\s\S]*?)\s*:::/g, (_, quote: string) =>
        blockquote(quote)
      )
      .replace(
        /<big-quote>\s*([\s\S]*?)\s*<\/big-quote>/g,
        (_, quote: string) => blockquote(quote)
      )
      .replace(
        /<quiz\s+[^>]*\/?>/g,
        `*Interactive quiz: take it on the [web version](${pageUrl}).*`
      )
      .replace(
        /<video-embed\s+src="([^"]+)"\s*\/?>/g,
        (_, src: string) => `[Video](${src})`
      )
      .replace(/<embed-frame\s+([^>]*?)\/?>/g, (_, attributes: string) => {
        const attribute = (name: string) =>
          attributes.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1];
        const title = attribute("title");
        const src = attribute("src");
        return `[Interactive demo${title ? `: ${title}` : ""}](${src ? absolute(src) : pageUrl})`;
      })
      // Links to drafts: keep the text only. (Images are skipped by the
      // lookbehind.)
      .replace(
        /(?<!!)\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
        (whole, label: string, href: string) =>
          isHiddenPostHref(href, hiddenPostKeys) ? label : whole
      )
      // Site-relative links, images and raw HTML attributes become absolute.
      .replace(
        /\]\((\/(?!\/)[^)]*)\)/g,
        (_, href: string) => `](${absolute(href)})`
      )
      .replace(
        /\b(src|href)="(\/(?!\/)[^"]*)"/g,
        (_, name: string, href: string) =>
          `${name}="${escapeAttribute(absolute(href))}"`
      )
  );

  const data: Record<string, unknown> = {
    title: metadata.title ?? "Untitled",
    ...(metadata.description && { description: metadata.description }),
    author: input.authorName,
    ...(metadata.date && { date: metadata.date }),
    lang,
    series: folder,
    ...(metadata.tags?.length && { tags: metadata.tags }),
    url: pageUrl,
  };

  return matter.stringify(
    `\n# ${metadata.title ?? "Untitled"}\n\n${text.trim()}\n`,
    data
  );
}
