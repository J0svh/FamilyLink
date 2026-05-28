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

// Helper: save avatar per user so it survives logout
function saveUserAvatar(userId: string, avatarId: string) {
  localStorage.setItem(`familylink-avatar-${userId}`, avatarId);
}

function getUserAvatar(userId: string): string | null {
  return localStorage.getItem(`familylink-avatar-${userId}`);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      email: null,
      username: null,
      avatarId: null,
      isAuthenticated: false,
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),
      setUser: (userId, email, username, avatarId) => {
        // Restore avatar from per-user storage if not provided
        const savedAvatar = getUserAvatar(userId);
        const finalAvatar = avatarId || savedAvatar || get().avatarId || null;
        if (finalAvatar && userId) {
          saveUserAvatar(userId, finalAvatar);
        }
        set({ userId, email, username, avatarId: finalAvatar });
      },
      setAvatarId: (avatarId) => {
        const userId = get().userId;
        if (userId) {
          saveUserAvatar(userId, avatarId);
        }
        set({ avatarId });
      },
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
