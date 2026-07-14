import { Logo } from "./logo";
import type { AuthDictionary } from "@/lib/dictionaries";

interface HeaderProps {
  dictionary: AuthDictionary;
}

export function Header(props: HeaderProps) {
  const { dictionary } = props;

  return (
    <>
      <Logo
        canvasSize={120}
        lineWidth={6}
        lineColor="hsl(262, 80%, 64%)"
        backgroundColor="transparent"
       
      />

      <h1 className="text-2xl font-semibold tracking-tight text-ink-heading text-center mb-2">
        {dictionary.login.connectWallet || "Welcome Back"}
      </h1>

      <span className="text-ink-muted block text-center mb-8 text-sm w-full">
        {dictionary.login.description}
      </span>
    </>
  );
}
