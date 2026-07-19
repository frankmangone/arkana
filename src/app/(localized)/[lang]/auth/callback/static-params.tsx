export function generateStaticParams() {
    // Always return params for static export, even if auth is disabled
    // The page component will handle showing 404 when auth is disabled
    return [{ lang: "en" }, { lang: "es" }, { lang: "pt" }];
}
