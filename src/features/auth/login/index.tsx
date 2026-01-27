import { Toaster } from "@/components/ui/sonner";
import { LoginForm } from "@/features/auth/login/components/login-form";

interface LoginPageProps {
  lang: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
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
