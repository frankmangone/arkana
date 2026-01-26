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
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
            <LoginForm lang={lang} dictionary={dictionary} />
        </div>
        <Toaster />
    </>
  );
}
