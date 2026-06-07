type BrandMarkVariant = 'light' | 'dark';

interface BrandMarkProps {
  variant?: BrandMarkVariant;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-16 w-16',
};

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-3xl',
};

export function BrandMark({
  variant = 'light',
  size = 'md',
  showText = true,
  subtitle,
  className = '',
}: BrandMarkProps) {
  const isDark = variant === 'dark';
  const logoSrc = isDark ? '/LogoFamiLyLInkvOscuro.png' : '/LogoFamilylink1024.png';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={logoSrc}
        alt="FamilyLink"
        className={`${sizeClasses[size]} shrink-0 object-contain`}
        draggable={false}
      />
      {showText && (
        <div className="min-w-0">
          <p
            className={`${textSizeClasses[size]} font-bold leading-none ${isDark ? 'text-white' : 'text-text-primary'}`}
          >
            FamilyLink
          </p>
          {subtitle && (
            <p
              className={`mt-1 text-sm leading-tight ${isDark ? 'text-white/60' : 'text-text-secondary'}`}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
