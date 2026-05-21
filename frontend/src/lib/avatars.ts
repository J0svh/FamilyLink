export interface AvatarOption {
  id: string;
  src: string;
  gender: 'male' | 'female' | 'neutral';
}

export const AVATARS: AvatarOption[] = [
  { id: 'avatar-01', src: '/avatars/avatar-01.webp', gender: 'female' },
  { id: 'avatar-02', src: '/avatars/avatar-02.webp', gender: 'female' },
  { id: 'avatar-03', src: '/avatars/avatar-03.webp', gender: 'female' },
  { id: 'avatar-04', src: '/avatars/avatar-04.webp', gender: 'neutral' },
  { id: 'avatar-05', src: '/avatars/avatar-05.webp', gender: 'male' },
  { id: 'avatar-06', src: '/avatars/avatar-06.webp', gender: 'female' },
  { id: 'avatar-07', src: '/avatars/avatar-07.webp', gender: 'female' },
  { id: 'avatar-08', src: '/avatars/avatar-08.webp', gender: 'female' },
  { id: 'avatar-09', src: '/avatars/avatar-09.webp', gender: 'female' },
  { id: 'avatar-10', src: '/avatars/avatar-10.webp', gender: 'female' },
  { id: 'avatar-11', src: '/avatars/avatar-11.webp', gender: 'female' },
  { id: 'avatar-12', src: '/avatars/avatar-12.webp', gender: 'male' },
  { id: 'avatar-13', src: '/avatars/avatar-13.webp', gender: 'female' },
  { id: 'avatar-14', src: '/avatars/avatar-14.webp', gender: 'female' },
  { id: 'avatar-15', src: '/avatars/avatar-15.webp', gender: 'male' },
  { id: 'avatar-16', src: '/avatars/avatar-16.webp', gender: 'male' },
  { id: 'avatar-17', src: '/avatars/avatar-17.webp', gender: 'male' },
  { id: 'avatar-18', src: '/avatars/avatar-18.webp', gender: 'male' },
  { id: 'avatar-19', src: '/avatars/avatar-19.webp', gender: 'female' },
  { id: 'avatar-20', src: '/avatars/avatar-20.webp', gender: 'female' },
];

export const DEFAULT_MALE = 'avatar-17';
export const DEFAULT_FEMALE = 'avatar-20';
export const DEFAULT_NEUTRAL = 'avatar-04';

export function getAvatarSrc(avatarId: string | null | undefined): string {
  if (!avatarId) return AVATARS.find(a => a.id === DEFAULT_NEUTRAL)!.src;
  const avatar = AVATARS.find(a => a.id === avatarId);
  return avatar?.src || AVATARS.find(a => a.id === DEFAULT_NEUTRAL)!.src;
}
