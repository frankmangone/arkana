"use client";

import { Button } from "@/components/ui/button";
import { GoogleSvg } from "./google-svg";
import { initiateGoogleLogin } from "@/lib/auth/google-oauth";
import { useParams } from "next/navigation";

interface GoogleLoginProps {
  lang: string;
}

export function GoogleLogin({ lang }: GoogleLoginProps) {
  const params = useParams();
  const currentLang = (params?.lang as string) || lang;

  const handleLogin = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const redirectUri = `${baseUrl}/${currentLang}/auth/callback`;
    initiateGoogleLogin(redirectUri);
  };

  return (
    <Button
      type="button"
      onClick={handleLogin}
      className="w-full cursor-pointer mb-4 h-12"
      size="lg"
      variant="outline"
    >
      <GoogleSvg />
      <span className="ml-2">Continue with Google</span>
    </Button>
  );
}
