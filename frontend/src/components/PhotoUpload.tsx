import { useRef, useState } from 'react';
import { showToast } from './Toast';

interface PhotoUploadProps {
  onPhotoReady: (dataUrl: string) => void;
  maxSizeKB?: number;
}

export function PhotoUpload({ onPhotoReady, maxSizeKB = 500 }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Solo se permiten imágenes', 'error');
      return;
    }

    // Compress client-side
    const compressed = await compressImage(file, maxSizeKB);
    setPreview(compressed);
    onPhotoReady(compressed);
  };

  const compressImage = (file: File, maxKB: number): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // Max 800px on longest side
          const maxDim = 800;
          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);

          // Try quality levels until under maxKB
          let quality = 0.8;
          let result = canvas.toDataURL('image/webp', quality);
          while (result.length / 1024 > maxKB && quality > 0.3) {
            quality -= 0.1;
            result = canvas.toDataURL('image/webp', quality);
          }

          resolve(result);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <button
        onClick={() => inputRef.current?.click()}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-background text-text-secondary transition-colors"
        title="Enviar foto"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
        </svg>
      </button>
      {preview && (
        <div className="absolute bottom-full mb-2 left-0 p-2 bg-surface rounded-[12px] shadow-lg border border-border">
          <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-[8px]" />
        </div>
      )}
    </>
  );
}
