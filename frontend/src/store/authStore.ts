import { create } from 'zustand';
import api from '../services/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

// Simple localStorage sync
const loadStoredAuth = () => {
  try {
    const stored = localStorage.getItem('skillswap-auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.state?.user || null,
        accessToken: parsed.state?.accessToken || null,
        refreshToken: parsed.state?.refreshToken || null,
        isAuthenticated: parsed.state?.isAuthenticated || false,
      };
    }
  } catch (e) {
    // ignore
  }
  return { user: null, accessToken: null, refreshToken: null, isAuthenticated: false };
};

const stored = loadStoredAuth();

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: stored.user,
  accessToken: stored.accessToken,
  refreshToken: stored.refreshToken,
  isAuthenticated: stored.isAuthenticated,
  isLoading: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setTokens: (accessToken, refreshToken) => {
    set({ accessToken, refreshToken, isAuthenticated: true });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data.data;
      set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/register', data);
      const { user, accessToken, refreshToken } = response.data.data;
      set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
    }
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const { refreshToken } = get();
    if (!refreshToken) {
      set({ isLoading: false });
      return;
    }

    try {
      const response = await api.post('/auth/refresh-token', { refreshToken });
      const { accessToken } = response.data.data;
      set({ accessToken });
      
      const profileResponse = await api.get('/auth/profile');
      set({ user: profileResponse.data.data, isAuthenticated: true });
    } catch (error) {
      set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));

// Subscribe to changes and persist
useAuthStore.subscribe((state) => {
  localStorage.setItem('skillswap-auth', JSON.stringify({ state: {
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    isAuthenticated: state.isAuthenticated,
  }}));
});