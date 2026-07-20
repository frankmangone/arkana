import { AuthCallbackClient } from "./auth-callback-client";

export { generateStaticParams } from "./static-params";

interface PageProps {
  params: Promise<{ lang: string }>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function AuthCallbackPage(_props: PageProps) {
  return <AuthCallbackClient />;
}
