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
        className="drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
      />

      <h1 className="text-2xl font-semibold text-white text-center mb-2">
        {dictionary.login.connectWallet || "Connect Your Wallet"}
      </h1>

      <span className="text-muted-foreground block text-center mb-8 text-sm w-full">
        {dictionary.login.description}
      </span>
    </>
  );
}
