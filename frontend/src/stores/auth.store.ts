import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { authApi } from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login({ email, password });
          const { user, token } = data.data;
          localStorage.setItem('token', token);
          connectSocket(token);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email, password, name) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.register({ email, password, name });
          const { user, token } = data.data;
          localStorage.setItem('token', token);
          connectSocket(token);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        disconnectSocket();
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchProfile: async () => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return;

        set({ isLoading: true });
        try {
          const { data } = await authApi.getProfile();
          connectSocket(token);
          set({ user: data.data, token, isAuthenticated: true, isLoading: false });
        } catch {
          localStorage.removeItem('token');
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },

      setUser: (user) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
