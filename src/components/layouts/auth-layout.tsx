import { Navbar } from "./navbar";
import { GlyphRain } from "@/components/glyph-rain";

interface AuthLayoutProps {
  children: React.ReactNode;
  lang: string;
}

export async function AuthLayout({ children, lang }: AuthLayoutProps) {
  return (
    <div className="home-hero relative min-h-screen flex flex-col">
      <Navbar lang={lang} />

      {/* Dark GlyphRain background, matching the homepage hero treatment */}
      <div
        className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_right,transparent_0%,black_15%,black_85%,transparent_100%)]"
        aria-hidden="true"
      >
        <GlyphRain animated={false} />
      </div>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center min-h-[calc(100vh-64px)] py-12">
        {children}
      </main>
    </div>
  );
}
