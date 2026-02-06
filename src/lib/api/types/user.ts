/**
 * User types matching backend models
 */
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
