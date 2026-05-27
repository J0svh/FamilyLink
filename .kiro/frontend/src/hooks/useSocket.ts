import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import { useMapStore } from '../stores/mapStore';

export function useSocket(circleId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);
  const updateMemberLocation = useMapStore((s) => s.updateMemberLocation);

  useEffect(() => {
    if (!circleId || !accessToken) return;

    const socket = io(import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '/', {
      path: '/ws',
      auth: { token: accessToken },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socket.emit('join:circle', circleId);
    });

    socket.on('location:updated', (data: { userId: string; coordinates: { lat: number; lng: number } }) => {
      updateMemberLocation(data.userId, data.coordinates.lat, data.coordinates.lng);
    });

    socket.on('privacy:activated', (data: { userId: string }) => {
      useMapStore.getState().setMembers(
        useMapStore.getState().members.map((m) =>
          m.userId === data.userId ? { ...m, isPrivacyModeActive: true } : m,
        ),
      );
    });

    socket.on('privacy:deactivated', (data: { userId: string }) => {
      useMapStore.getState().setMembers(
        useMapStore.getState().members.map((m) =>
          m.userId === data.userId ? { ...m, isPrivacyModeActive: false } : m,
        ),
      );
    });

    socketRef.current = socket;

    return () => {
      socket.emit('leave:circle', circleId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [circleId, accessToken, updateMemberLocation]);

  return socketRef;
}
