export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'exploration' | 'social' | 'streak' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  condition: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'explorer-1', name: 'Explorador', description: 'Comparte tu ubicación 3 veces en un día', emoji: '🗺️', category: 'exploration', rarity: 'common', condition: 'share_3_day' },
  { id: 'communicator', name: 'Comunicador', description: 'Envía 10 mensajes en el chat', emoji: '💬', category: 'social', rarity: 'common', condition: 'messages_10' },
  { id: 'cartographer', name: 'Cartógrafo', description: 'Crea tu primera zona', emoji: '📍', category: 'exploration', rarity: 'common', condition: 'create_zone_1' },
  { id: 'marathoner', name: 'Maratonista', description: 'Comparte ubicación 7 días seguidos', emoji: '🏃', category: 'streak', rarity: 'rare', condition: 'streak_7_days' },
  { id: 'leader', name: 'Líder', description: 'Crea 3 círculos', emoji: '👑', category: 'social', rarity: 'rare', condition: 'circles_3' },
  { id: 'traveler', name: 'Viajero', description: 'Visita 5 zonas diferentes', emoji: '🌍', category: 'exploration', rarity: 'epic', condition: 'visit_zones_5' },
  { id: 'on-fire', name: 'En Racha', description: '30 días consecutivos activo', emoji: '🔥', category: 'streak', rarity: 'legendary', condition: 'streak_30_days' },
  { id: 'social-butterfly', name: 'Mariposa Social', description: 'Únete a 5 círculos', emoji: '🦋', category: 'social', rarity: 'epic', condition: 'join_circles_5' },
  { id: 'night-owl', name: 'Búho Nocturno', description: 'Comparte ubicación después de medianoche', emoji: '🦉', category: 'special', rarity: 'rare', condition: 'share_midnight' },
  { id: 'early-bird', name: 'Madrugador', description: 'Comparte ubicación antes de las 7am', emoji: '🐦', category: 'special', rarity: 'rare', condition: 'share_early' },
];

export const RARITY_COLORS: Record<string, string> = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500',
};

export const RARITY_LABELS: Record<string, string> = {
  common: 'Común',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Legendario',
};
