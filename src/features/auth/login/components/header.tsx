import { DecoderSigil } from "@/components/decoder-sigil";
import type { AuthDictionary } from "@/lib/dictionaries";

interface HeaderProps {
  dictionary: AuthDictionary;
}

export function Header(props: HeaderProps) {
  const { dictionary } = props;
  const title = dictionary.login.connectWallet || "Welcome Back";

  return (
    <>
      <DecoderSigil
        content={title}
        className="w-48 md:w-56 mx-auto mb-6"
        lineColor="#ffffff"
      />

      <h1 className="text-2xl font-semibold tracking-tight text-ink-heading text-center mb-2">
        {title}
      </h1>

      <span className="text-ink-muted block text-center mb-8 text-sm w-full">
        {dictionary.login.description}
      </span>
    </>
  );
}
