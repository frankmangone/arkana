'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGoogleAuth } from '@/lib/api';
import { extractOAuthCode } from '@/lib/auth/google-oauth';
import { toast } from 'sonner';

export function AuthCallbackClient() {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'en';
  const googleAuth = useGoogleAuth();
  const [, setIsProcessing] = useState(true);
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple executions (React strict mode in dev)
    if (hasProcessed.current) {
      return;
    }

    const handleAuthCallback = async () => {
      hasProcessed.current = true;
      
      try {
        // Extract code from URL
        const oauthData = extractOAuthCode();
        
        if (!oauthData) {
          toast.error('Failed to authenticate. Please try again.');
          router.push(`/${lang}/login`);
          return;
        }

        // Get the redirect URI that was used (must match what was sent to Google)
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const redirectUri = `${baseUrl}/${lang}/auth/callback`;

        // Exchange code for tokens
        await googleAuth.mutateAsync({ 
          code: oauthData.code,
          redirectUri: redirectUri,
        });
        
        toast.success('Signed in successfully!');
        
        // Redirect to home page
        router.push(`/${lang}`);
        router.refresh();
      } catch (error: any) {
        console.error('Auth callback error:', error);
        const errorMessage =
          error?.response?.data?.error || 'Authentication failed. Please try again.';
        toast.error(errorMessage);
        router.push(`/${lang}/login`);
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [router, lang, googleAuth]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Signing you in...</h1>
        <p className="mt-2 text-muted-foreground">
          Please wait while we complete the authentication process.
        </p>
      </div>
    </div>
  );
}
