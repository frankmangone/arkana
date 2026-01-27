'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { GoogleSvg } from './google-svg';
import { initiateGoogleLogin } from '@/lib/auth/google-oauth';
import { toast } from 'sonner';

interface LoginFormProps {
  lang: string;
  dictionary: {
    login: {
      title: string;
      description: string;
      loginWithGoogle: string;
      signingIn: string;
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">
          {dictionary.login.title}
        </CardTitle>
        <CardDescription>
          {dictionary.login.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full cursor-pointer"
          size="lg"
          variant="outline"
        >
          <GoogleSvg />
          {dictionary.login.loginWithGoogle}
        </Button>
      </CardContent>
    </Card>
  );
}
