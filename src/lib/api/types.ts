// User types matching backend models
export interface User {
  id: number;
  email: string;
  username: string;
  auth_provider: string;
  provider_user_id?: string | null;
  email_verified: boolean;
  avatar_url?: string | null;
  created_at: string;
  updated_at?: string | null;
}

// Auth types
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface ErrorResponse {
  error: string;
}

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  username: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
}

export interface GoogleTokenRequest {
  code: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}
