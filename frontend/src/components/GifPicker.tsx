import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GifResult {
  id: string;
  url: string;
  preview: string;
}

interface GifPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (gifUrl: string) => void;
}

export function GifPicker({ isOpen, onClose, onSelect }: GifPickerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GifResult[]>([]);
  const [trending, setTrending] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const GIPHY_KEY = import.meta.env.VITE_GIPHY_KEY || '';

  useEffect(() => {
    if (isOpen && GIPHY_KEY) loadTrending();
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchGifs(query), 400);
  }, [query]);

  const loadTrending = async () => {
    try {
      const res = await fetch(`https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_KEY}&limit=20&rating=g`);
      const data = await res.json();
      setTrending(data.data?.map(mapResult) || []);
    } catch { /* silent */ }
  };

  const searchGifs = async (q: string) => {
    if (!GIPHY_KEY) return;
    setLoading(true);
    try {
      const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(q)}&limit=20&rating=g`);
      const data = await res.json();
      setResults(data.data?.map(mapResult) || []);
    } catch { /* silent */ }
    setLoading(false);
  };

  const mapResult = (r: any): GifResult => ({
    id: r.id,
    url: r.images?.original?.url || r.images?.downsized?.url || '',
    preview: r.images?.fixed_width_small?.url || r.images?.preview_gif?.url || r.images?.fixed_width?.url || '',
  });

  const displayResults = query.trim() ? results : trending;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 300, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-border overflow-hidden bg-background"
        >
          <div className="px-3 py-2 border-b border-border">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar GIFs..."
              className="w-full px-3 py-2 bg-surface border border-border rounded-[10px] text-sm text-text-primary placeholder-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-accent/30"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-3 gap-1 p-2 overflow-y-auto h-[230px]">
            {loading ? (
              <div className="col-span-3 flex items-center justify-center h-full">
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : displayResults.length === 0 ? (
              <div className="col-span-3 flex items-center justify-center h-full">
                <p className="text-text-secondary text-xs">
                  {!GIPHY_KEY ? 'API key no configurada' : query ? 'Sin resultados' : 'Cargando...'}
                </p>
              </div>
            ) : (
              displayResults.map(gif => (
                <button
                  key={gif.id}
                  onClick={() => { onSelect(gif.url); onClose(); }}
                  className="aspect-square rounded-[8px] overflow-hidden hover:ring-2 hover:ring-accent transition-all"
                >
                  <img src={gif.preview} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))
            )}
          </div>

          <div className="px-3 py-1 border-t border-border">
            <p className="text-[9px] text-text-secondary/50 text-center">Powered by GIPHY</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
