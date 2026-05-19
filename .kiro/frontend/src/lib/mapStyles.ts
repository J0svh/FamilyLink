export const MAP_STYLES = {
  streets: 'https://api.maptiler.com/maps/streets-v2/style.json?key=KEY',
  dark: 'https://api.maptiler.com/maps/dataviz-dark/style.json?key=KEY',
  satellite: 'https://api.maptiler.com/maps/hybrid/style.json?key=KEY',
  toner: 'https://api.maptiler.com/maps/toner-v2/style.json?key=KEY',
} as const;

export type MapStyleKey = keyof typeof MAP_STYLES;

export function getMapStyle(style: MapStyleKey): string {
  const key = import.meta.env.VITE_MAPTILER_KEY || '';
  return MAP_STYLES[style].replace('KEY', key);
}
