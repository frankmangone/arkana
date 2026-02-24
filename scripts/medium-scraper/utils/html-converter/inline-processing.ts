import * as cheerio from "cheerio";

export function processInlineElements(element: cheerio.Cheerio): string {
  let html = element.html() || "";

  html = html.replace(
    /<em class="(?:mj|ni|[a-z]{1,3})"[^>]*>(.*?)<\/em>/g,
    "**$1**"
  );
  html = html.replace(/<em>(.*?)<\/em>/g, "**$1**");
  html = html.replace(/<strong[^>]*>(.*?)<\/strong>/g, "**$1**");

  html = html.replace(
    /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g,
    (_match: string, href: string, text: string) => {
      const isMediumLink =
        href.includes("medium.com") || href.startsWith("/") || href.startsWith("#");

      if (isMediumLink) {
        return `[${text}]()`;
      }

      return `[${text}](${href})`;
    }
  );

  html = html.replace(/<code[^>]*>(.*?)<\/code>/g, "`$1`");

  const tempElement = cheerio.load(html);
  let text = tempElement.root().text().trim();

  text = text.replace(/…/g, "...");
  text = text.replace(/\s+/g, " ");

  return text;
}
