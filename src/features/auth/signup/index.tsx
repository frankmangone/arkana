import { Toaster } from "@/components/ui/sonner";
import { SignupForm } from "@/features/auth/signup/components/signup-form";

interface SignupPageProps {
  lang: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
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
