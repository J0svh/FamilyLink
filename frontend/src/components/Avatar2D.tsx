import { getAvatarSrc } from '../lib/avatars';

export type AvatarState = 'idle' | 'walking' | 'sleeping' | 'working';

interface Avatar2DProps {
  username: string;
  avatarId?: string | null;
  state?: AvatarState;
  isCurrentUser?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const STATE_LABELS: Record<AvatarState, string> = {
  idle: '',
  walking: '🚶 En movimiento',
  sleeping: '😴 Descansando',
  working: '💼 Trabajando',
};

const SIZE_MAP = {
  sm: { img: 'w-8 h-8', ring: 'ring-2' },
  md: { img: 'w-11 h-11', ring: 'ring-[3px]' },
  lg: { img: 'w-14 h-14', ring: 'ring-[3px]' },
};

export function Avatar2D({
  username,
  avatarId,
  state = 'idle',
  isCurrentUser = false,
  size = 'md',
}: Avatar2DProps) {
  const src = getAvatarSrc(avatarId);
  const sizeClasses = SIZE_MAP[size];

  return (
    <div className="flex flex-col items-center gap-0.5">
      {/* Avatar image */}
      <div className="relative">
        {isCurrentUser && (
          <div className="absolute -inset-1 bg-accent/30 rounded-full animate-ping" />
        )}
        <img
          src={src}
          alt={username}
          className={`${sizeClasses.img} rounded-full ${sizeClasses.ring} ring-white shadow-lg object-cover`}
        />
      </div>

      {/* Name */}
      <div className="px-2 py-0.5 bg-surface/90 backdrop-blur-sm rounded-full shadow-sm mt-0.5">
        <span className="text-[10px] font-semibold text-text-primary">{username}</span>
      </div>

      {/* Status text (only if not idle) */}
      {state !== 'idle' && STATE_LABELS[state] && (
        <span className="text-[8px] text-text-secondary bg-surface/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
          {STATE_LABELS[state]}
        </span>
      )}
    </div>
  );
}
