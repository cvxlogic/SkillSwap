import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSocketStore } from '../store/socketStore';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role?: string }) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading, login: storeLogin, register: storeRegister, logout: storeLogout, setUser, checkAuth } = useAuthStore();
  const { connect, disconnect } = useSocketStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const token = useAuthStore.getState().accessToken;
    if (token && isAuthenticated) {
      connect(token);
    } else {
      disconnect();
    }
  }, [isAuthenticated]);

  const login = async (email: string, password: string) => {
    await storeLogin(email, password);
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      connect(accessToken);
    }
  };

  const register = async (data: { name: string; email: string; password: string; role?: string }) => {
    await storeRegister(data);
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      connect(accessToken);
    }
  };

  const logout = () => {
    storeLogout();
    disconnect();
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}