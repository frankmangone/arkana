import { AuthLayout } from "@/components/layouts/auth-layout";
import { getDictionary } from "@/lib/dictionaries";
import { LoginPage } from "@/features/auth/login";

export { generateStaticParams } from "../static-params";
export { generateMetadata } from "./metadata";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function Page({ params }: PageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <AuthLayout lang={lang}>
      <LoginPage lang={lang} dictionary={dict.auth} />
    </AuthLayout>
  );
}
