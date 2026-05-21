import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  users: { userId: string; username: string }[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const text = users.length === 1
    ? `${users[0].username} está escribiendo`
    : users.length === 2
    ? `${users[0].username} y ${users[1].username} están escribiendo`
    : `${users[0].username} y ${users.length - 1} más están escribiendo`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      className="flex items-center gap-2 px-4 py-2"
    >
      {/* Animated dots */}
      <div className="flex gap-0.5">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-text-secondary/50 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
      <span className="text-xs text-text-secondary/70 italic">{text}</span>
    </motion.div>
  );
}
