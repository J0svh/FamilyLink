/**
 * Avatar2D Component — Fase 1
 * 
 * Renders a pixel-art style avatar with state-based animations.
 * Designed to be extensible for Phase 2 (sprite sheets, customization).
 * 
 * States: idle, walking, sleeping, working
 * Future: custom sprites, clothing layers, accessories
 */

export type AvatarState = 'idle' | 'walking' | 'sleeping' | 'working';

interface Avatar2DProps {
  username: string;
  state?: AvatarState;
  isCurrentUser?: boolean;
  /** Future: avatar config for customization */
  config?: {
    skinColor?: string;
    hairColor?: string;
    shirtColor?: string;
  };
  size?: 'sm' | 'md' | 'lg';
}

const STATE_EMOJI: Record<AvatarState, string> = {
  idle: '🧍',
  walking: '🚶',
  sleeping: '😴',
  working: '💼',
};

const STATE_LABEL: Record<AvatarState, string> = {
  idle: '',
  walking: 'En movimiento',
  sleeping: 'Descansando',
  working: 'Ocupado',
};

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-base',
  md: 'w-12 h-12 text-xl',
  lg: 'w-16 h-16 text-2xl',
};

export function Avatar2D({
  username,
  state = 'idle',
  isCurrentUser = false,
  config,
  size = 'md',
}: Avatar2DProps) {
  const bgColor = config?.shirtColor || (isCurrentUser ? '#007AFF' : '#34C759');

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Avatar body */}
      <div className="relative">
        {/* Pulse ring for current user */}
        {isCurrentUser && (
          <div
            className="absolute -inset-1 rounded-full animate-ping opacity-30"
            style={{ backgroundColor: bgColor }}
          />
        )}

        {/* Avatar circle with emoji */}
        <div
          className={`${SIZE_CLASSES[size]} rounded-full border-2 border-white shadow-lg flex items-center justify-center relative overflow-hidden`}
          style={{ backgroundColor: bgColor }}
        >
          {/* State emoji */}
          <span className={state === 'walking' ? 'animate-bounce' : state === 'sleeping' ? 'opacity-70' : ''}>
            {STATE_EMOJI[state]}
          </span>
        </div>

        {/* State indicator dot */}
        {state !== 'idle' && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-surface rounded-full border border-border flex items-center justify-center">
            <span className="text-[8px]">
              {state === 'sleeping' ? '💤' : state === 'working' ? '⚡' : '👣'}
            </span>
          </div>
        )}
      </div>

      {/* Name label */}
      <div className="px-2 py-0.5 bg-surface/90 backdrop-blur-sm rounded-full shadow-sm max-w-20">
        <span className="text-[10px] font-medium text-text-primary truncate block text-center">
          {username}
        </span>
      </div>

      {/* State label (only if not idle) */}
      {state !== 'idle' && STATE_LABEL[state] && (
        <span className="text-[8px] text-text-secondary bg-surface/80 px-1.5 py-0.5 rounded-full">
          {STATE_LABEL[state]}
        </span>
      )}
    </div>
  );
}
