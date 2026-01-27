export function generateStaticParams() {
  // Only generate static params if auth is enabled
  if (process.env.NEXT_PUBLIC_AUTH_ENABLED !== 'true') {
    return [];
  }
  
  return [{ lang: 'en' }, { lang: 'es' }, { lang: 'pt' }];
}
