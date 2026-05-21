import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { haptics } from '../lib/haptics';

const REACTION_EMOJIS = ['❤️', '😂', '👍', '😮', '😢', '🔥'];

interface Reaction {
  emoji: string;
  userId: string;
  username: string;
}

interface MessageReactionsProps {
  messageId: string;
  circleId: string;
  reactions: Reaction[];
  currentUserId: string;
  onReact: (messageId: string, emoji: string) => void;
}

export function MessageReactions({ messageId, reactions, currentUserId, onReact }: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  const groupedReactions = reactions.reduce<Record<string, Reaction[]>>((acc, r) => {
    acc[r.emoji] = acc[r.emoji] || [];
    acc[r.emoji].push(r);
    return acc;
  }, {});

  const handleReact = (emoji: string) => {
    haptics.light();
    onReact(messageId, emoji);
    setShowPicker(false);
  };

  return (
    <div className="relative">
      {/* Existing reactions */}
      {Object.keys(groupedReactions).length > 0 && (
        <div className="flex gap-1 mt-1 flex-wrap">
          {Object.entries(groupedReactions).map(([emoji, users]) => (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border transition-all ${
                users.some(u => u.userId === currentUserId)
                  ? 'bg-accent/10 border-accent/30'
                  : 'bg-background border-border hover:border-accent/30'
              }`}
            >
              <span>{emoji}</span>
              <span className="text-[10px] text-text-secondary">{users.length}</span>
            </button>
          ))}
        </div>
      )}

      {/* Reaction picker (triggered by long press or button) */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-full mb-1 left-0 bg-surface rounded-full shadow-xl border border-border px-2 py-1.5 flex gap-1 z-10"
          >
            {REACTION_EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background transition-all hover:scale-125 active:scale-90 text-lg"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 -right-2 w-6 h-6 bg-surface border border-border rounded-full flex items-center justify-center text-xs shadow-sm hover:scale-110"
      >
        +
      </button>
    </div>
  );
}
