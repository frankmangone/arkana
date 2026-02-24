import * as cheerio from "cheerio";

export function isHeadingElement(tagName: string): boolean {
  return /^h[1-6]$/.test(tagName);
}

export function isParagraphElement(tagName: string): boolean {
  return tagName === "p";
}

export function isUnorderedListElement(tagName: string): boolean {
  return tagName === "ul";
}

export function isOrderedListElement(tagName: string): boolean {
  return tagName === "ol";
}

export function isBlockquoteElement(tagName: string): boolean {
  return tagName === "blockquote";
}

export function isSeparatorElement(
  tagName: string,
  element: cheerio.Cheerio
): boolean {
  return tagName === "div" && element.attr("role") === "separator";
}

export function isCodeBlockElement(tagName: string): boolean {
  return tagName === "pre";
}

export function isFigureElement(tagName: string): boolean {
  return tagName === "figure";
}

export function isBigQuoteElement(element: cheerio.Cheerio): boolean {
  return element.hasClass("pr");
}
