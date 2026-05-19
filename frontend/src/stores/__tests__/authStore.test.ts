import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      userId: null,
      email: null,
      username: null,
      isAuthenticated: false,
    });
  });

  it('should start unauthenticated', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
  });

  it('should set tokens and mark as authenticated', () => {
    useAuthStore.getState().setTokens('access-123', 'refresh-456');
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe('access-123');
    expect(state.refreshToken).toBe('refresh-456');
  });

  it('should set user info', () => {
    useAuthStore.getState().setUser('user-1', 'test@example.com', 'testuser');
    const state = useAuthStore.getState();
    expect(state.userId).toBe('user-1');
    expect(state.email).toBe('test@example.com');
    expect(state.username).toBe('testuser');
  });

  it('should logout and clear all state', () => {
    useAuthStore.getState().setTokens('access', 'refresh');
    useAuthStore.getState().setUser('id', 'email', 'name');
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.userId).toBeNull();
  });
});
