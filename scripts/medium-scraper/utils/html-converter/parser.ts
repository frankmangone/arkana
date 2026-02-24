import * as cheerio from "cheerio";
import {
  isBlockquoteElement,
  isCodeBlockElement,
  isFigureElement,
  isHeadingElement,
  isOrderedListElement,
  isParagraphElement,
  isSeparatorElement,
  isUnorderedListElement,
} from "./element-detectors";
import {
  pushBlockquoteContent,
  pushCodeBlockContent,
  pushFigureContent,
  pushHeadingContent,
  pushListContent,
  pushParagraphContent,
} from "./element-handlers";
import type { ParsedHtmlResult } from "./types";

function formatDate(dateString: string): string {
  if (!dateString) {
    return "";
  }

  try {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  } catch {
    console.warn("Could not parse date:", dateString);
    return dateString;
  }
}

function getArticleTitle($: cheerio.Root, articleTitle?: string): string {
  return articleTitle || $("h3").first().text().trim() || $("h4").first().text().trim();
}

export function parseHtmlToMarkdownBody(
  htmlContent: string,
  articleTitle?: string
): ParsedHtmlResult {
  const $ = cheerio.load(htmlContent);

  const title = getArticleTitle($, articleTitle);
  const readingTime = "";
  const publishDate = "";
  const formattedDate = formatDate(publishDate);

  const content: string[] = [];

  const selector =
    "h1, h2, h3, h4, h5, h6, p, pre, figure, blockquote, ul, ol, div[role='separator']";

  $(selector).each((_, el: any) => {
    const element = $(el);
    const tagName = element.prop("tagName")?.toLowerCase();

    if (!tagName) {
      return;
    }

    if (isHeadingElement(tagName)) {
      pushHeadingContent(element, tagName, content);
      return;
    }

    if (isParagraphElement(tagName)) {
      pushParagraphContent(element, content);
      return;
    }

    if (isUnorderedListElement(tagName)) {
      pushListContent($, element, false, content);
      return;
    }

    if (isOrderedListElement(tagName)) {
      pushListContent($, element, true, content);
      return;
    }

    if (isBlockquoteElement(tagName)) {
      pushBlockquoteContent(element, content);
      return;
    }

    if (isSeparatorElement(tagName, element)) {
      content.push("\n---\n");
      return;
    }

    if (isCodeBlockElement(tagName)) {
      pushCodeBlockContent(element, content);
      return;
    }

    if (isFigureElement(tagName)) {
      pushFigureContent(element, content);
    }
  });

  const markdownBody = content
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    markdownBody,
    title,
    readingTime,
    formattedDate,
  };
}
