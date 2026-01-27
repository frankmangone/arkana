import { AuthLayout } from '@/components/layouts/auth-layout';
import { getDictionary } from '@/lib/dictionaries';
import { notFound } from 'next/navigation';
import { LoginPage } from '@/features/auth/login';

export { generateStaticParams } from '../static-params';
export { generateMetadata } from './metadata';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function Page({ params }: PageProps) {
  // If auth is not enabled, return 404
  if (process.env.NEXT_PUBLIC_AUTH_ENABLED !== 'true') {
    notFound();
  }

  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <AuthLayout lang={lang}>
      <LoginPage lang={lang} dictionary={dict.auth} />
    </AuthLayout>
  );
}
