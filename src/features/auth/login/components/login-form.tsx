import { Suspense } from "react";
import { Header } from "./header";
import { GoogleLogin } from "./google-login";
import { FAQNotes } from "./faq-notes";
import { Loader2 } from "lucide-react";
import type { AuthDictionary } from "@/lib/dictionaries";

interface LoginFormProps {
  lang: string;
  dictionary: AuthDictionary;
}

function LoginButtonsFallback() {
  return (
    <div className="w-full mb-4 h-12 flex items-center justify-center">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  );
}

export function LoginForm({ lang, dictionary }: LoginFormProps) {
  return (
    <div className="w-full max-w-md mx-auto mb-28 px-4">
      <Header dictionary={dictionary} />

      <Suspense fallback={<LoginButtonsFallback />}>
        <GoogleLogin lang={lang} />
      </Suspense>

      <FAQNotes lang={lang} dictionary={dictionary} />
    </div>
  );
}
