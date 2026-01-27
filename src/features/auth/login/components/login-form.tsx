'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { GoogleSvg } from './google-svg';
import { initiateGoogleLogin } from '@/lib/auth/google-oauth';
import { toast } from 'sonner';
import { Logo } from './logo';

interface LoginFormProps {
  lang: string;
  dictionary: {
    login: {
      title: string;
      description: string;
      loginWithGoogle: string;
      signingIn: string;
      continueWithEmail?: string;
      termsText?: string;
      termsLink?: string;
      privacyLink?: string;
    };
  };
}

export function LoginForm({ lang, dictionary }: LoginFormProps) {
  const handleGoogleLogin = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const redirectUri = `${baseUrl}/${lang}/auth/callback`;
    
    try {
      initiateGoogleLogin(redirectUri);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to initiate Google login. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleEmailLogin = () => {
    toast.info('Email login is coming soon. Please use Google login for now.');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-background p-8 shadow-lg border-0 drop-shadow-[0_0_40px_rgba(59,40,93,0.4)]">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Logo
              canvasSize={120}
              lineWidth={6}
              lineColor="hsl(262, 80%, 64%)"
              backgroundColor="transparent"
              className="drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-white text-center mb-2">
          {dictionary.login.title}
        </h1>

        {/* Description */}
        <span className="text-muted-foreground block text-center mb-8 text-sm w-full">
          {dictionary.login.description}
        </span>

        {/* Google Sign In Button */}
        <Button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full mb-4 h-12 bg-background border border-border hover:bg-accent"
          size="lg"
          variant="outline"
        >
          <GoogleSvg />
          <span className="ml-2">{dictionary.login.loginWithGoogle}</span>
        </Button>

        {/* OR Separator */}
        {/* <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative bg-background px-4">
            <span className="text-sm text-muted-foreground">OR</span>
          </div>
        </div> */}

        {/* Email Button */}
        {/* <Button
          type="button"
          onClick={handleEmailLogin}
          className="w-full h-12 bg-background border border-border hover:bg-accent"
          size="lg"
          variant="outline"
        >
          <Mail className="w-5 h-5" />
          <span className="ml-2">
            {dictionary.login.continueWithEmail || 'Continue with Email'}
          </span>
        </Button> */}

        {/* Terms and Privacy */}
        <span className="text-xs text-muted-foreground block text-center mt-4">
          {dictionary.login.termsText || 'By continuing, you agree to our'}{' '}
          <Link 
            href={dictionary.login.termsLink || '/terms'} 
            className="text-primary-750 hover:text-primary-650 transition-colors"
          >
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link 
            href={dictionary.login.privacyLink || '/privacy'} 
            className="text-primary-750 hover:text-primary-650 transition-colors"
          >
            Privacy Policy
          </Link>
        </span>
      </div>
    </div>
  );
}
