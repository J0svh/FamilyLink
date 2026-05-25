import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { GifPicker } from './GifPicker';
import { VoiceRecorder } from './VoiceRecorder';
import { PhotoUpload } from './PhotoUpload';
import { PollCreator } from './PollCreator';
import { ChatThemePicker } from './ChatThemePicker';
import { TypingIndicator } from './TypingIndicator';
import { incrementChallenge } from './DailyChallenges';

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

const EMOJI_CATEGORIES: Record<string, string[]> = {
  '😀': ['😀', '😃', '😄', '😁', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😋', '😛', '😜', '🤪', '😎', '🤩', '🥳', '😏', '😒', '🙄', '😬', '😮', '😯', '😲', '😳', '🥺', '😢', '😭', '😤', '😠', '😡', '🤯', '😴', '🤮', '🤧', '😷'],
  '👋': ['👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '🤝', '🙏', '✌️', '🤞', '🤟', '🤘', '👌', '🤌', '👈', '👉', '👆', '👇', '💪', '👋', '🖐️', '✋', '🤚', '🖖'],
  '❤️': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '🔥', '✨', '🌟', '💫', '⭐', '🎉', '🎊', '🎈', '🎁', '🏆'],
  '🏠': ['🏠', '🏢', '🏫', '🚗', '🚕', '🚌', '🚲', '✈️', '🚀', '📍', '🗺️', '🌍', '☀️', '🌙', '⛅', '🌧️', '❄️', '🌈', '🍕', '🍔', '☕', '🍺', '🎮', '📱', '💻', '📚'],
};

const themeColors: Record<string, string> = {
  blue: 'from-[#007AFF] to-[#0056CC]',
  purple: 'from-[#AF52DE] to-[#7B2CBF]',
  green: 'from-[#34C759] to-[#248A3D]',
  orange: 'from-[#FF9500] to-[#CC7700]',
  pink: 'from-[#FF2D55] to-[#CC2244]',
  teal: 'from-[#5AC8FA] to-[#32ADE6]',
  red: 'from-[#FF3B30] to-[#CC2F26]',
  dark: 'from-[#1C1C1E] to-[#3A3A3C]',
};

export function CircleChat({ circleId, isOpen, onClose }: CircleChatProps) {
  const userId = useAuthStore((s) => s.userId);
  const username = useAuthStore((s) => s.username);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [activeEmojiTab, setActiveEmojiTab] = useState('😀');
  const [showGif, setShowGif] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [chatTheme, setChatTheme] = useState('blue');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && circleId) loadMessages();
  }, [isOpen, circleId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    // Load cached messages first for instant display
    const cached = localStorage.getItem(`familylink-chat-${circleId}`);
    if (cached) {
      try {
        const cachedMsgs = JSON.parse(cached);
        if (Array.isArray(cachedMsgs) && cachedMsgs.length > 0) {
          setMessages(cachedMsgs);
        }
      } catch { /* ignore parse errors */ }
    }

    try {
      const { data } = await api.get(`/chat/circles/${circleId}/messages`);
      setMessages(data.messages);
      // Cache messages locally
      localStorage.setItem(`familylink-chat-${circleId}`, JSON.stringify(data.messages));
    } catch (err) {
      console.error('Failed to load messages', err);
      // Keep cached messages as fallback
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
    setShowGif(false);

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
      setMessages(prev => {
        const updated = prev.map(m => m.messageId === optimisticMsg.messageId ? data : m);
        localStorage.setItem(`familylink-chat-${circleId}`, JSON.stringify(updated));
        return updated;
      });
      incrementChallenge('message');
    } catch {
      setMessages(prev => prev.filter(m => m.messageId !== optimisticMsg.messageId));
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  const handleGifSelect = async (gifUrl: string) => {
    const optimisticMsg: Message = {
      messageId: `temp-${Date.now()}`,
      userId: userId || '',
      username: username || '',
      content: gifUrl,
      type: 'gif',
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const { data } = await api.post(`/chat/circles/${circleId}/messages`, { content: gifUrl, type: 'gif' });
      setMessages(prev => prev.map(m => m.messageId === optimisticMsg.messageId ? data : m));
    } catch {
      setMessages(prev => prev.filter(m => m.messageId !== optimisticMsg.messageId));
    }
  };

  const handleVoiceRecorded = async (audioBlob: Blob, duration: number) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const optimisticMsg: Message = {
        messageId: `temp-${Date.now()}`,
        userId: userId || '',
        username: username || '',
        content: `🎤 Nota de voz (${duration}s)`,
        type: 'voice',
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, optimisticMsg]);

      try {
        const { data } = await api.post(`/chat/circles/${circleId}/messages`, { content: base64, type: 'voice', duration });
        setMessages(prev => prev.map(m => m.messageId === optimisticMsg.messageId ? data : m));
      } catch {
        setMessages(prev => prev.filter(m => m.messageId !== optimisticMsg.messageId));
      }
    };
    reader.readAsDataURL(audioBlob);
  };

  const handlePhotoReady = async (dataUrl: string) => {
    const optimisticMsg: Message = {
      messageId: `temp-${Date.now()}`,
      userId: userId || '',
      username: username || '',
      content: dataUrl,
      type: 'photo',
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const { data } = await api.post(`/chat/circles/${circleId}/messages`, { content: dataUrl, type: 'photo' });
      setMessages(prev => prev.map(m => m.messageId === optimisticMsg.messageId ? data : m));
      incrementChallenge('photo');
    } catch {
      setMessages(prev => prev.filter(m => m.messageId !== optimisticMsg.messageId));
    }
  };

  const insertEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
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

  // Dummy typing users for now (will be replaced with real hook)
  const typingUsers: { userId: string; username: string }[] = [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="fixed inset-0 sm:inset-auto sm:bottom-0 sm:right-4 sm:w-[380px] sm:h-[600px] sm:rounded-t-[20px] bg-surface shadow-2xl z-50 flex flex-col overflow-hidden"
        >
          {/* Header with gradient */}
          <div className={`bg-gradient-to-r ${themeColors[chatTheme] || themeColors.blue} px-5 py-4 flex items-center justify-between`}>
            <div>
              <h3 className="font-semibold text-white text-base">Chat</h3>
              <p className="text-xs text-white/70">{messages.length} mensajes</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Poll button */}
              <button
                onClick={() => setShowPollCreator(true)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                title="Crear encuesta"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 20V10M12 20V4M6 20v-6" />
                </svg>
              </button>
              {/* Theme picker button */}
              <button
                onClick={() => setShowThemePicker(true)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                title="Tema del chat"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68 1.65 1.65 0 0010 3.17V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              </button>
              {/* Close button */}
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 1l12 12M13 1L1 13" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                  </div>
                  <p className="text-text-secondary text-sm font-medium">No hay mensajes</p>
                  <p className="text-text-secondary/50 text-xs mt-1">Envía el primero</p>
                </div>
              </div>
            ) : (
              groupedMessages.map((group) => (
                <div key={group.date}>
                  <div className="flex items-center justify-center my-4">
                    <span className="text-[10px] text-text-secondary bg-background px-3 py-1 rounded-full font-medium">
                      {formatDate(group.msgs[0].createdAt)}
                    </span>
                  </div>
                  {group.msgs.map((msg, i) => {
                    const isMe = msg.userId === userId;
                    const showAvatar = i === 0 || group.msgs[i - 1].userId !== msg.userId;
                    return (
                      <div key={msg.messageId} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-1'}`}>
                        <div className={`flex gap-2 max-w-[75%] ${isMe ? 'flex-row-reverse' : ''}`}>
                          {!isMe && showAvatar && (
                            <div className="w-7 h-7 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-[10px] font-bold text-white">{msg.username.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                          {!isMe && !showAvatar && <div className="w-7" />}
                          <div>
                            {!isMe && showAvatar && (
                              <p className="text-[10px] text-text-secondary mb-1 ml-1 font-medium">{msg.username}</p>
                            )}
                            <div className={`px-3.5 py-2.5 ${isMe ? `bg-gradient-to-br ${themeColors[chatTheme] || themeColors.blue} text-white rounded-[18px] rounded-br-[4px]` : 'bg-background text-text-primary rounded-[18px] rounded-bl-[4px]'}`}>
                              {msg.type === 'gif' ? (
                                <img src={msg.content} alt="GIF" className="max-w-[200px] rounded-[12px]" loading="lazy" />
                              ) : msg.type === 'photo' ? (
                                <img src={msg.content} alt="Foto" className="max-w-[200px] rounded-[12px]" loading="lazy" />
                              ) : (
                                <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                              )}
                            </div>
                            <p className={`text-[9px] mt-1 ${isMe ? 'text-right' : 'text-left'} text-text-secondary/50 px-1`}>
                              {formatTime(msg.createdAt)}
                            </p>
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
                animate={{ height: 220, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-border overflow-hidden bg-background"
              >
                <div className="flex gap-2 px-4 py-2 border-b border-border">
                  {Object.keys(EMOJI_CATEGORIES).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveEmojiTab(tab)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-lg ${activeEmojiTab === tab ? 'bg-accent/10' : 'hover:bg-surface'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-8 gap-0.5 p-3 overflow-y-auto h-[160px]">
                  {EMOJI_CATEGORIES[activeEmojiTab]?.map((emoji, i) => (
                    <button
                      key={`${emoji}-${i}`}
                      onClick={() => insertEmoji(emoji)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface transition-colors text-xl active:scale-90"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* GIF picker */}
          <GifPicker
            isOpen={showGif}
            onClose={() => setShowGif(false)}
            onSelect={handleGifSelect}
          />

          {/* Typing indicator */}
          <AnimatePresence>
            <TypingIndicator users={typingUsers} />
          </AnimatePresence>

          {/* Input */}
          <div className="border-t border-border px-4 py-3 bg-surface">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setShowEmoji(!showEmoji); setShowGif(false); }}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${showEmoji ? 'bg-accent text-white scale-110' : 'hover:bg-background text-text-secondary'}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
                  <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </button>

              {/* Photo upload button */}
              <PhotoUpload onPhotoReady={handlePhotoReady} />

              {/* GIF button */}
              <button
                type="button"
                onClick={() => { setShowGif(!showGif); setShowEmoji(false); }}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all text-xs font-bold ${showGif ? 'bg-accent text-white scale-110' : 'hover:bg-background text-text-secondary'}`}
                title="GIFs"
              >
                GIF
              </button>

              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                maxLength={2000}
                className="flex-1 px-4 py-2.5 bg-background border border-border rounded-full text-sm text-text-primary placeholder-text-secondary/40 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/50 transition-all"
              />

              {/* Show VoiceRecorder when input is empty, otherwise show send button */}
              {!newMessage.trim() ? (
                <VoiceRecorder onRecorded={handleVoiceRecorded} />
              ) : (
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-accent text-white disabled:opacity-20 transition-all hover:scale-105 active:scale-95"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              )}
            </form>
          </div>

          {/* Chat Theme Picker modal */}
          <ChatThemePicker
            isOpen={showThemePicker}
            onClose={() => setShowThemePicker(false)}
            currentTheme={chatTheme}
            onThemeChange={setChatTheme}
          />

          {/* Poll Creator modal */}
          <PollCreator
            circleId={circleId}
            isOpen={showPollCreator}
            onClose={() => setShowPollCreator(false)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
