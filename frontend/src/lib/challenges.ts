export interface ChallengeDefinition {
  id: string;
  emoji: string;
  title: string;
  description: string;
  target: number;
  trackKey: string;
  rewardEmoji: string;
  rewardName: string;
}

const CHALLENGE_POOL: ChallengeDefinition[] = [
  { id: 'share-3', emoji: '📍', title: 'Explorador', description: 'Comparte tu ubicación 3 veces', target: 3, trackKey: 'share', rewardEmoji: '🗺️', rewardName: 'Explorador' },
  { id: 'messages-5', emoji: '💬', title: 'Comunicador', description: 'Envía 5 mensajes en el chat', target: 5, trackKey: 'message', rewardEmoji: '⭐', rewardName: 'Comunicador' },
  { id: 'zone-1', emoji: '🗺️', title: 'Cartógrafo', description: 'Crea 1 zona nueva', target: 1, trackKey: 'zone', rewardEmoji: '📍', rewardName: 'Cartógrafo' },
  { id: 'arrived-2', emoji: '🏠', title: 'Seguro en casa', description: 'Usa "Llegué bien" 2 veces', target: 2, trackKey: 'arrived', rewardEmoji: '🏡', rewardName: 'Hogareño' },
  { id: 'ghost-1', emoji: '👻', title: 'Fantasma', description: 'Activa modo fantasma', target: 1, trackKey: 'ghost', rewardEmoji: '👻', rewardName: 'Fantasma' },
  { id: 'heatmap-1', emoji: '🔥', title: 'Analista', description: 'Activa el mapa de calor', target: 1, trackKey: 'heatmap', rewardEmoji: '🔥', rewardName: 'Analista' },
  { id: 'center-3', emoji: '🎯', title: 'Centrado', description: 'Usa "centrar en mí" 3 veces', target: 3, trackKey: 'center', rewardEmoji: '🎯', rewardName: 'Centrado' },
  { id: 'poll-1', emoji: '📊', title: 'Encuestador', description: 'Crea 1 encuesta', target: 1, trackKey: 'poll', rewardEmoji: '📊', rewardName: 'Encuestador' },
  { id: 'darkmap-1', emoji: '🌙', title: 'Nocturno', description: 'Cambia al estilo nocturno', target: 1, trackKey: 'darkmap', rewardEmoji: '🌙', rewardName: 'Nocturno' },
  { id: 'photo-2', emoji: '📸', title: 'Fotógrafo', description: 'Envía 2 fotos en el chat', target: 2, trackKey: 'photo', rewardEmoji: '📸', rewardName: 'Fotógrafo' },
];

interface DailyState {
  date: string;
  selectedIds: string[];
  progress: Record<string, number>;
  claimed: string[];
  yesterdayIds: string[];
  streak: number;
  lastStreakDate: string;
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function getState(): DailyState {
  const stored = localStorage.getItem('familylink-daily-challenges');
  if (stored) {
    const state: DailyState = JSON.parse(stored);
    if (state.date === getTodayKey()) return state;
    // New day — rotate challenges
    const newState = createNewDay(state);
    saveState(newState);
    return newState;
  }
  const fresh = createNewDay(null);
  saveState(fresh);
  return fresh;
}

function createNewDay(prev: DailyState | null): DailyState {
  const yesterdayIds = prev?.selectedIds || [];
  const available = CHALLENGE_POOL.filter(c => !yesterdayIds.includes(c.id));
  const shuffled = available.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);

  // Update streak
  let streak = prev?.streak || 0;
  if (prev && prev.date === getYesterdayKey() && prev.claimed.length > 0) {
    streak++;
  } else if (!prev || prev.date !== getYesterdayKey()) {
    streak = 0;
  }

  return {
    date: getTodayKey(),
    selectedIds: selected.map(c => c.id),
    progress: {},
    claimed: [],
    yesterdayIds,
    streak,
    lastStreakDate: getTodayKey(),
  };
}

function saveState(state: DailyState) {
  localStorage.setItem('familylink-daily-challenges', JSON.stringify(state));
}

export function incrementChallenge(trackKey: string) {
  const state = getState();
  state.progress[trackKey] = (state.progress[trackKey] || 0) + 1;
  saveState(state);
}

export function claimChallenge(challengeId: string) {
  const state = getState();
  if (!state.claimed.includes(challengeId)) {
    state.claimed.push(challengeId);
    saveState(state);
  }
}

export function getDailyChallenges(): { challenges: (ChallengeDefinition & { current: number; completed: boolean; claimed: boolean })[]; streak: number } {
  const state = getState();
  const challenges = state.selectedIds.map(id => {
    const def = CHALLENGE_POOL.find(c => c.id === id)!;
    const current = state.progress[def.trackKey] || 0;
    return {
      ...def,
      current,
      completed: current >= def.target,
      claimed: state.claimed.includes(id),
    };
  });
  return { challenges, streak: state.streak };
}

export function getUnclaimedMedals(): string[] {
  const stored = localStorage.getItem('familylink-medals');
  return stored ? JSON.parse(stored) : [];
}

export function addMedal(rewardEmoji: string) {
  const medals = getUnclaimedMedals();
  if (!medals.includes(rewardEmoji)) {
    medals.push(rewardEmoji);
    localStorage.setItem('familylink-medals', JSON.stringify(medals));
  }
}
