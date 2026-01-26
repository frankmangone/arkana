import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth';
import type {
  LoginRequest,
  SignupRequest,
  GoogleTokenRequest,
  AuthResponse,
  User,
} from '../types';

/**
 * React Query hooks for authentication
 */

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

/**
 * Get current authenticated user
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authService.getCurrentUser(),
    enabled: authService.isAuthenticated(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Login mutation
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (data: AuthResponse) => {
      // Invalidate and refetch user data
      queryClient.setQueryData(authKeys.me(), data.user);
    },
  });
}

/**
 * Signup mutation
 */
export function useSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignupRequest) => authService.signup(data),
    onSuccess: (data: AuthResponse) => {
      // Invalidate and refetch user data
      queryClient.setQueryData(authKeys.me(), data.user);
    },
  });
}

/**
 * Logout mutation
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
}

/**
 * Google OAuth mutation
 */
export function useGoogleAuth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => authService.googleToken(code),
    onSuccess: (data: AuthResponse) => {
      // Invalidate and refetch user data
      queryClient.setQueryData(authKeys.me(), data.user);
    },
  });
}

/**
 * Refresh token mutation
 */
export function useRefreshToken() {
  return useMutation({
    mutationFn: (refreshToken: string) => authService.refresh(refreshToken),
  });
}
