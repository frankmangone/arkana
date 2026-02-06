import type { User } from "./user";

/**
 * Auth response containing tokens and user information
 */
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Signup request payload
 */
export interface SignupRequest {
  email: string;
  username: string;
  password: string;
}

/**
 * Refresh token request payload
 */
export interface RefreshTokenRequest {
  refresh_token: string;
}

/**
 * Refresh token response
 */
export interface RefreshTokenResponse {
  access_token: string;
}

/**
 * Google OAuth token request payload
 */
export interface GoogleTokenRequest {
  code: string;
  redirect_uri: string;
}
