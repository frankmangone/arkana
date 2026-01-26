import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user';
import type { User } from '../types';

/**
 * React Query hooks for user operations
 */

// Query keys
export const userKeys = {
  all: ['users'] as const,
  detail: (id: number) => [...userKeys.all, id] as const,
};

/**
 * Get user by ID
 */
export function useUser(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create user mutation
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      email: string;
      username: string;
      password?: string;
      auth_provider?: string;
      provider_user_id?: string;
    }) => userService.createUser(data),
    onSuccess: (data: User) => {
      // Invalidate user list and set the new user in cache
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.setQueryData(userKeys.detail(data.id), data);
    },
  });
}
