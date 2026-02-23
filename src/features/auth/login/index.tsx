import { Toaster } from "@/components/ui/sonner";
import { LoginForm } from "@/features/auth/login/components/login-form";
import type { AuthDictionary } from "@/lib/dictionaries";

interface LoginPageProps {
  lang: string;
  dictionary: AuthDictionary;
}

export function LoginPage(props: LoginPageProps) {
  const { lang, dictionary } = props;

  return (
    <>
      <LoginForm lang={lang} dictionary={dictionary} />
      <Toaster />
    </>
  );
}
