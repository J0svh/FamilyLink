import { useState, useEffect } from 'react';

interface LastSeenProps {
  timestamp: string | null;
  className?: string;
}

function formatLastSeen(timestamp: string | null): string {
  if (!timestamp) return 'Sin conexión';

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'En línea';
  if (diffMin < 5) return 'Hace un momento';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export function LastSeen({ timestamp, className = '' }: LastSeenProps) {
  const [text, setText] = useState(formatLastSeen(timestamp));

  useEffect(() => {
    setText(formatLastSeen(timestamp));
    const interval = setInterval(() => setText(formatLastSeen(timestamp)), 30000);
    return () => clearInterval(interval);
  }, [timestamp]);

  const isOnline = text === 'En línea';

  return (
    <span className={`text-xs ${isOnline ? 'text-success' : 'text-text-secondary'} ${className}`}>
      {isOnline && <span className="inline-block w-1.5 h-1.5 bg-success rounded-full mr-1 animate-pulse" />}
      {text}
    </span>
  );
}
