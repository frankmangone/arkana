/**
 * Google OAuth utilities
 * Handles the OAuth flow with Google
 */

/**
 * Generate a secure random string for OAuth state parameter
 */
function generateSecureRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Initiate Google OAuth login flow
 * Redirects user to Google's authorization page
 */
export function initiateGoogleLogin(redirectUri: string): void {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    throw new Error('Google Client ID is not configured');
  }

  // Generate state and nonce for CSRF protection
  const state = generateSecureRandomString(32);
  const nonce = generateSecureRandomString(32);
  
  // Store in sessionStorage for verification in callback
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_nonce', nonce);
  }
  
  // Build Google OAuth URL
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state: state,
    nonce: nonce,
    access_type: 'offline', // Request refresh token
    prompt: 'select_account', // Show account selector
  });
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  
  // Redirect to Google
  window.location.href = authUrl;
}

/**
 * Extract OAuth code from URL callback
 * Returns the code if valid, null otherwise
 */
export function extractOAuthCode(): { code: string; state: string } | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const error = urlParams.get('error');
  
  if (error) {
    console.error('OAuth error:', error);
    return null;
  }
  
  if (!code || !state) {
    return null;
  }
  
  // Verify state (CSRF protection)
  const storedState = sessionStorage.getItem('oauth_state');
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('OAuth state verification:', {
      received: state,
      stored: storedState,
      match: state === storedState,
    });
  }
  
  if (!storedState) {
    console.error('No stored state found - session may have been cleared');
    return null;
  }
  
  if (state !== storedState) {
    console.error('State mismatch - possible CSRF attack', {
      received: state,
      stored: storedState,
    });
    return null;
  }
  
  // Clean up sessionStorage
  sessionStorage.removeItem('oauth_state');
  sessionStorage.removeItem('oauth_nonce');
  
  return { code, state };
}
