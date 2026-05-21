import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  email: string | null;
  username: string | null;
  avatarId: string | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (userId: string, email: string, username: string, avatarId?: string) => void;
  setAvatarId: (avatarId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      email: null,
      username: null,
      avatarId: null,
      isAuthenticated: false,
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),
      setUser: (userId, email, username, avatarId) =>
        set({ userId, email, username, avatarId: avatarId || null }),
      setAvatarId: (avatarId) => set({ avatarId }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          userId: null,
          email: null,
          username: null,
          avatarId: null,
          isAuthenticated: false,
        }),
    }),
    { name: 'familylink-auth' },
  ),
);
