import { useState, useEffect } from 'react';

interface BatteryIndicatorProps {
  className?: string;
}

export function BatteryIndicator({ className = '' }: BatteryIndicatorProps) {
  const [level, setLevel] = useState<number | null>(null);
  const [charging, setCharging] = useState(false);

  useEffect(() => {
    if (!('getBattery' in navigator)) return;

    (navigator as any).getBattery().then((battery: any) => {
      setLevel(Math.round(battery.level * 100));
      setCharging(battery.charging);

      battery.addEventListener('levelchange', () => setLevel(Math.round(battery.level * 100)));
      battery.addEventListener('chargingchange', () => setCharging(battery.charging));
    });
  }, []);

  if (level === null) return null;

  const color = level > 50 ? 'text-success' : level > 20 ? 'text-warning' : 'text-error';

  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] ${color} ${className}`}>
      {charging && '⚡'}
      <svg width="14" height="8" viewBox="0 0 14 8" fill="none" className="inline">
        <rect x="0.5" y="0.5" width="11" height="7" rx="1.5" stroke="currentColor" strokeWidth="0.8"/>
        <rect x="12" y="2" width="1.5" height="4" rx="0.5" fill="currentColor"/>
        <rect x="1.5" y="1.5" width={`${(level / 100) * 9}`} height="5" rx="0.8" fill="currentColor"/>
      </svg>
      <span className="font-medium">{level}%</span>
    </span>
  );
}
