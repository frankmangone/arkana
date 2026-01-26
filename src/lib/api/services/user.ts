import apiClient from '../client';
import type { User } from '../types';

/**
 * User API service
 * Handles all user-related API calls
 */
export const userService = {
  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get<User>(`/api/users/${id}`);
    return response.data;
  },

  /**
   * Create a new user
   */
  async createUser(data: {
    email: string;
    username: string;
    password?: string;
    auth_provider?: string;
    provider_user_id?: string;
  }): Promise<User> {
    const response = await apiClient.post<User>('/api/users', data);
    return response.data;
  },
};
