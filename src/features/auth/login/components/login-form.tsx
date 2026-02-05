import { Header } from "./header";
import { MetamaskLogin } from "./metamask-login";
import { PolkadotLogin } from "./polkadot-login";
import { Terms } from "./terms";

interface LoginFormProps {
  lang: string;
  dictionary: {
    login: {
      title: string;
      description: string;
      connectWallet?: string;
      connectMetaMask?: string;
      connectPolkadot?: string;
      connecting?: string;
      termsText?: string;
      termsLink?: string;
      privacyLink?: string;
    };
  };
}

export function LoginForm({ lang, dictionary }: LoginFormProps) {
  return (
    <div className="w-full max-w-md mx-auto mb-28">
      <div className="bg-background p-8 shadow-lg border-0 drop-shadow-[0_0_40px_rgba(59,40,93,0.4)]">
        <Header dictionary={dictionary} />

        <MetamaskLogin lang={lang} dictionary={dictionary} />
        {false && <PolkadotLogin lang={lang} dictionary={dictionary} />}

        <Terms dictionary={dictionary} />
      </div>
    </div>
  );
}
