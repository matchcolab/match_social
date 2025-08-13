import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Debug authentication state
  console.log('useAuth - data:', user, 'isLoading:', isLoading, 'error:', error);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
