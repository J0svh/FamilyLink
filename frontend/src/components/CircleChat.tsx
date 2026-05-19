import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

interface Message {
  messageId: string;
  userId: string;
  username: string;
  content: string;
  type: string;
  createdAt: string;
}

interface CircleChatProps {
  circleId: string;
  isOpen: boolean;
  onClose: () => void;
}

const EMOJI_QUICK = ['😀', '😂', '❤️', '👍', '🙏', '🎉', '🔥', '😊', '😢', '🤔', '💪', '✨', '🏠', '📍', '🚗', '☕'];

const EMOJI_CATEGORIES = {
  'Caras': ['😀', '😃', '😄', '😁', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮', '😯', '😲', '😳', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '😈', '💀', '💩', '🤡', '👻', '😴'],
  'Gestos': ['👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✌️', '🤞', '🤟', '🤘', '👌', '🤌', '👈', '👉', '👆', '👇', '☝️', '💪', '🦾', '🖐️', '✋', '👋'],
  'Objetos': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '🔥', '✨', '🌟', '💫', '⭐', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇'],
  'Viaje': ['🏠', '🏢', '🏫', '🏥', '🚗', '🚕', '🚌', '🚎', '🚲', '🛴', '✈️', '🚀', '📍', '🗺️', '🌍', '☀️', '🌙', '⛅', '🌧️', '❄️'],
};

export function CircleChat({ circleId, isOpen, onClose }: CircleChatProps) {
  const userId = useAuthStore((s) => s.userId);
  const username = useAuthStore((s) => s.username);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState<string>('Caras');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && circleId) {
      loadMessages();
    }
  }, [isOpen, circleId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const { data } = await api.get(`/chat/circles/${circleId}/messages`);
      setMessages(data.messages);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || sending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);
    setShowEmoji(false);

    // Optimistic update
    const optimisticMsg: Message = {
      messageId: `temp-${Date.now()}`,
      userId: userId || '',
      username: username || '',
      content,
      type: 'text',
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const { data } = await api.post(`/chat/circles/${circleId}/messages`, { content });
      // Replace optimistic with real
      setMessages(prev => prev.map(m => m.messageId === optimisticMsg.messageId ? data : m));
    } catch (err) {
      // Remove optimistic on error
      setMessages(prev => prev.filter(m => m.messageId !== optimisticMsg.messageId));
      setNewMessage(content); // restore input
    } finally {
      setSending(false);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Hoy';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce<{ date: string; msgs: Message[] }[]>((groups, msg) => {
    const date = new Date(msg.createdAt).toDateString();
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && new Date(lastGroup.msgs[0].createdAt).toDateString() === date) {
      lastGroup.msgs.push(msg);
    } else {
      groups.push({ date, msgs: [msg] });
    }
    return groups;
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-surface shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface">
            <div>
              <h3 className="font-semibold text-text-primary text-base">Chat del círculo</h3>
              <p className="text-xs text-text-secondary">{messages.length} mensajes</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background transition-colors text-text-secondary"
            >
              ✕
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-text-secondary text-sm">Cargando mensajes...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-3xl mb-2">💬</p>
                  <p className="text-text-secondary text-sm">No hay mensajes aún</p>
                  <p className="text-text-secondary/60 text-xs mt-1">Sé el primero en escribir</p>
                </div>
              </div>
            ) : (
              groupedMessages.map((group) => (
                <div key={group.date}>
                  {/* Date separator */}
                  <div className="flex items-center justify-center my-4">
                    <span className="text-[10px] text-text-secondary bg-background px-3 py-1 rounded-full">
                      {formatDate(group.msgs[0].createdAt)}
                    </span>
                  </div>

                  {/* Messages */}
                  {group.msgs.map((msg, i) => {
                    const isMe = msg.userId === userId;
                    const showAvatar = i === 0 || group.msgs[i - 1].userId !== msg.userId;

                    return (
                      <div
                        key={msg.messageId}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-3' : 'mt-0.5'}`}
                      >
                        <div className={`flex gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : ''}`}>
                          {/* Avatar */}
                          {!isMe && showAvatar && (
                            <div className="w-7 h-7 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-xs font-semibold text-accent">
                                {msg.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          {!isMe && !showAvatar && <div className="w-7" />}

                          {/* Bubble */}
                          <div>
                            {!isMe && showAvatar && (
                              <p className="text-[10px] text-text-secondary mb-0.5 ml-1">{msg.username}</p>
                            )}
                            <div
                              className={`px-3.5 py-2 rounded-[16px] ${
                                isMe
                                  ? 'bg-accent text-white rounded-br-[4px]'
                                  : 'bg-background text-text-primary rounded-bl-[4px]'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                              <p className={`text-[9px] mt-0.5 ${isMe ? 'text-white/60' : 'text-text-secondary/60'} text-right`}>
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Emoji picker */}
          <AnimatePresence>
            {showEmoji && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 250, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-border overflow-hidden"
              >
                {/* Category tabs */}
                <div className="flex gap-1 px-3 py-2 border-b border-border overflow-x-auto">
                  {Object.keys(EMOJI_CATEGORIES).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setEmojiCategory(cat)}
                      className={`px-2.5 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                        emojiCategory === cat ? 'bg-accent text-white' : 'text-text-secondary hover:bg-background'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {/* Emoji grid */}
                <div className="grid grid-cols-8 gap-1 p-3 overflow-y-auto h-[190px]">
                  {EMOJI_CATEGORIES[emojiCategory as keyof typeof EMOJI_CATEGORIES]?.map((emoji, i) => (
                    <button
                      key={`${emoji}-${i}`}
                      onClick={() => handleEmojiClick(emoji)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-background transition-colors text-xl"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input area */}
          <div className="border-t border-border px-4 py-3 bg-surface">
            {/* Quick emoji bar */}
            <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
              {EMOJI_QUICK.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => handleEmojiClick(emoji)}
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-background transition-colors text-sm flex-shrink-0"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-2">
              {/* Emoji toggle */}
              <button
                type="button"
                onClick={() => setShowEmoji(!showEmoji)}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
                  showEmoji ? 'bg-accent text-white' : 'hover:bg-background text-text-secondary'
                }`}
              >
                😊
              </button>

              {/* Text input */}
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                maxLength={2000}
                className="flex-1 px-4 py-2.5 bg-background border border-border rounded-full text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />

              {/* Send button */}
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-accent text-white disabled:opacity-30 transition-opacity"
              >
                ↑
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
