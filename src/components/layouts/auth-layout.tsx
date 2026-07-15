import { Navbar } from "./navbar";
import { AuthPatternBackground } from "./auth-pattern-background";

interface AuthLayoutProps {
  children: React.ReactNode;
  lang: string;
}

export async function AuthLayout({ children, lang }: AuthLayoutProps) {
  return (
    <div className="brand-hero relative min-h-screen flex flex-col">
      <Navbar lang={lang} />

      {/* Background patterns container */}
      <AuthPatternBackground />

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center min-h-[calc(100vh-64px)] py-12">
        {children}
      </main>
    </div>
  );
}
