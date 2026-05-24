import { createContext, useContext } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => api.get('/api/auth/me').then((r) => r.data),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const logoutMutation = useMutation({
    mutationFn: () => api.post('/api/auth/logout'),
    onSuccess: () => {
      queryClient.clear()
      window.location.href = '/login'
    },
  })

  return (
    <AuthContext.Provider value={{ user, isLoading, logout: logoutMutation.mutate }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
