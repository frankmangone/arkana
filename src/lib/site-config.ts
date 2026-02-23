export const DEFAULT_SITE_URL = "https://arkana.blog";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;

export function withLocalePath(locale: string, path = ""): string {
  const normalizedPath = path.replace(/^\/+/, "");
  return `/${locale}${normalizedPath ? `/${normalizedPath}` : ""}`;
}

export function withSiteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
