import apiClient from '../client';
import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  GoogleTokenRequest,
  User,
} from '../types';

/**
 * Auth API service
 * Handles all authentication-related API calls
 */
export const authService = {
  /**
   * Sign up a new user
   */
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/signup', data);
    
    // Store tokens in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }
    
    return response.data;
  },

  /**
   * Log in an existing user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    
    // Store tokens in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }
    
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   */
  async refresh(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>('/api/auth/refresh', {
      refresh_token: refreshToken,
    } as RefreshTokenRequest);
    
    // Update access token in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.data.access_token);
    }
    
    return response.data;
  },

  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    try {
      // Get refresh token before clearing localStorage
      const refreshToken = typeof window !== 'undefined' 
        ? localStorage.getItem('refresh_token') 
        : null;
      
      if (refreshToken) {
        await apiClient.post('/api/auth/logout', {
          refresh_token: refreshToken,
        } as RefreshTokenRequest);
      }
    } finally {
      // Clear tokens regardless of API response
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/api/auth/me');
    return response.data;
  },

  /**
   * Authenticate with Google OAuth code
   */
  async googleToken(code: string, redirectUri: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/google/token', {
        code: code,
        redirect_uri: redirectUri,
      } as GoogleTokenRequest);
      
      // Store tokens in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Google OAuth token exchange error:', error);
      throw error;
    }
  },

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('access_token');
  },

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  },

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  },
};
