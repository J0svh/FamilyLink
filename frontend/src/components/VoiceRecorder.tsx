import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { haptics } from '../lib/haptics';

interface VoiceRecorderProps {
  onRecorded: (audioBlob: Blob, duration: number) => void;
}

export function VoiceRecorder({ onRecorded }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const finalDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
        onRecorded(blob, finalDuration);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start(100);
      startTimeRef.current = Date.now();
      setRecording(true);
      haptics.medium();

      timerRef.current = setInterval(() => {
        setDuration(Math.round((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch {
      // Microphone not available
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      setDuration(0);
      if (timerRef.current) clearInterval(timerRef.current);
      haptics.success();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      chunksRef.current = []; // discard
      setRecording(false);
      setDuration(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (recording) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-error/5 rounded-full border border-error/20">
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-3 h-3 bg-error rounded-full"
        />
        <span className="text-sm font-mono text-error">{formatDuration(duration)}</span>
        <button onClick={cancelRecording} className="text-text-secondary text-xs hover:text-error">✕</button>
        <button onClick={stopRecording} className="ml-auto w-8 h-8 bg-accent rounded-full flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={startRecording}
      className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-background text-text-secondary transition-colors"
      title="Mensaje de voz"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
        <path d="M19 10v2a7 7 0 01-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
    </button>
  );
}
