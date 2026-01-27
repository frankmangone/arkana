import { notFound } from 'next/navigation';
import { AuthCallbackClient } from './auth-callback-client';
import { Toaster } from '@/components/ui/sonner';

export { generateStaticParams } from './static-params';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function AuthCallbackPage({ params }: PageProps) {
  // If auth is not enabled, return 404
  if (process.env.NEXT_PUBLIC_AUTH_ENABLED !== 'true') {
    notFound();
  }

  return (
    <>
      <AuthCallbackClient />
      <Toaster />
    </>
  );
}
