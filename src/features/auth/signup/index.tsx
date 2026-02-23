import { Toaster } from "@/components/ui/sonner";
import { SignupForm } from "@/features/auth/signup/components/signup-form";
import type { AuthDictionary } from "@/lib/dictionaries";

interface SignupPageProps {
  lang: string;
  dictionary: AuthDictionary;
}

export function SignupPage(props: SignupPageProps) {
  const { lang, dictionary } = props;

  return (
    <>
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
        <SignupForm lang={lang} dictionary={dictionary} />
      </div>
      <Toaster />
    </>
  );
}
