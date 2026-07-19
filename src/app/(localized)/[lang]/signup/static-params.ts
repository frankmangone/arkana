export function generateStaticParams() {
  // Not used for now
  return [];

  // Only generate static params if auth is enabled
  // if (process.env.NEXT_PUBLIC_AUTH_ENABLED !== "true") {
  //   return [];
  // }

  // return [{ lang: "en" }, { lang: "es" }, { lang: "pt" }];
}
