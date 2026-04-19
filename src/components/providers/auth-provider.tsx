"use client";

import { createContext, useCallback, useContext } from "react";
import type { User } from "@/lib/api/types/user";
import { useCurrentUser, useLogout } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();
  const logoutMutation = useLogout();

  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  return (
    <AuthContext.Provider value={{ user: user ?? null, loading: isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
