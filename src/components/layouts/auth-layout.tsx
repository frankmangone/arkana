import { Navbar } from "./navbar";
import { AuthPatternBackground } from "./auth-pattern-background";

interface AuthLayoutProps {
  children: React.ReactNode;
  lang: string;
}

export async function AuthLayout({ children, lang }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <Navbar lang={lang} />
      
      {/* Background patterns container */}
      <AuthPatternBackground />

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center min-h-[calc(100vh-80px)] py-12">
        {children}
      </main>
    </div>
  );
}
