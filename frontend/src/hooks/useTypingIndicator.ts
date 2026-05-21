import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';

interface TypingUser {
  userId: string;
  username: string;
  timestamp: number;
}

export function useTypingIndicator(circleId: string | null) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const userId = useAuthStore((s) => s.userId);
  const username = useAuthStore((s) => s.username);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!circleId) return;

    const socket = io('/', { path: '/ws', transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('chat:typing', (data: { userId: string; username: string }) => {
      if (data.userId === userId) return;
      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.userId !== data.userId);
        return [...filtered, { ...data, timestamp: Date.now() }];
      });
    });

    socket.on('chat:stop-typing', (data: { userId: string }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    // Clean up stale typing indicators (older than 5s)
    const cleanup = setInterval(() => {
      setTypingUsers(prev => prev.filter(u => Date.now() - u.timestamp < 5000));
    }, 2000);

    return () => {
      socket.disconnect();
      clearInterval(cleanup);
    };
  }, [circleId, userId]);

  const emitTyping = useCallback(() => {
    if (!socketRef.current || !circleId) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socketRef.current.emit('chat:typing', { circleId, userId, username });
    }

    // Reset timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socketRef.current?.emit('chat:stop-typing', { circleId, userId });
    }, 3000);
  }, [circleId, userId, username]);

  const stopTyping = useCallback(() => {
    if (!socketRef.current || !circleId) return;
    isTypingRef.current = false;
    socketRef.current.emit('chat:stop-typing', { circleId, userId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }, [circleId, userId]);

  return { typingUsers, emitTyping, stopTyping };
}
