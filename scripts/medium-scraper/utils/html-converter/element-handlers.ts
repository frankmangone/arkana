import * as cheerio from "cheerio";
import { isBigQuoteElement } from "./element-detectors";
import { processInlineElements } from "./inline-processing";

export function pushHeadingContent(
  element: cheerio.Cheerio,
  tagName: string,
  content: string[]
): void {
  const htmlLevel = parseInt(tagName[1], 10);
  const markdownLevel = Math.max(1, htmlLevel - 1);
  const headingText = processInlineElements(element);

  content.push(`\n${"#".repeat(markdownLevel)} ${headingText}\n`);
}

export function pushParagraphContent(
  element: cheerio.Cheerio,
  content: string[]
): void {
  const text = processInlineElements(element);
  if (text) {
    content.push(`\n${text}\n`);
  }
}

export function pushListContent(
  $: cheerio.Root,
  element: cheerio.Cheerio,
  ordered: boolean,
  content: string[]
): void {
  const listItems: string[] = [];

  element.find("li").each((index: number, liEl: any) => {
    const itemText = processInlineElements($(liEl));
    if (!itemText) {
      return;
    }

    if (ordered) {
      listItems.push(`${index + 1}. ${itemText}`);
      return;
    }

    listItems.push(`- ${itemText}`);
  });

  if (listItems.length > 0) {
    content.push(`\n${listItems.join("\n")}\n`);
  }
}

export function pushBlockquoteContent(
  element: cheerio.Cheerio,
  content: string[]
): void {
  const text = processInlineElements(element);
  if (!text) {
    return;
  }

  if (isBigQuoteElement(element)) {
    content.push(`\n::: big-quote\n${text}\n:::\n`);
    return;
  }

  const quotedText = text
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");

  content.push(`\n${quotedText}\n`);
}

export function pushCodeBlockContent(
  element: cheerio.Cheerio,
  content: string[]
): void {
  const code = element.find("span").text().trim();
  if (code) {
    content.push(`\n\`\`\`\n${code}\n\`\`\`\n`);
  }
}

export function pushFigureContent(
  element: cheerio.Cheerio,
  content: string[]
): void {
  const figcaption = element.find("figcaption");
  const caption = figcaption.length > 0 ? figcaption.text().trim() : "";

  const image = element.find("img");
  if (image.length === 0) {
    return;
  }

  const imageUrl = image.attr("src");
  if (!imageUrl) {
    return;
  }

  content.push(
    `\n<figure>\n\t<img\n\t\tsrc="${imageUrl}"\n\t\talt="" ${
      caption ? `\n\t\ttitle="${caption.replace(/…/g, "...")}"` : ""
    }\n\t/>\n</figure>\n`
  );
}
