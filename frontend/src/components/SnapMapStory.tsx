import { motion } from 'framer-motion';
import { getAvatarSrc } from '../lib/avatars';

interface StoryItem {
  userId: string;
  username: string;
  avatarId: string | null;
  action: string;
  timeAgo: string;
}

interface SnapMapStoryProps {
  stories: StoryItem[];
  onStoryClick?: (userId: string) => void;
}

export function SnapMapStory({ stories, onStoryClick }: SnapMapStoryProps) {
  if (stories.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto scrollbar-hide pointer-events-auto">
      {stories.slice(0, 5).map((story, i) => (
        <motion.button
          key={story.userId}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          onClick={() => onStoryClick?.(story.userId)}
          className="flex items-center gap-3 bg-surface/90 backdrop-blur-md rounded-[14px] px-4 py-2.5 shadow-md border border-border/50 hover:border-accent/30 transition-all min-w-[220px]"
        >
          {story.avatarId ? (
            <img src={getAvatarSrc(story.avatarId)} alt="" className="w-9 h-9 rounded-full flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full flex-shrink-0 bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">{story.username.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div className="text-left min-w-0">
            <p className="text-xs font-semibold text-text-primary truncate">{story.username}</p>
            <p className="text-[10px] text-text-secondary truncate">{story.action} · {story.timeAgo}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
