import { create } from 'zustand';

type MapStyle = 'streets' | 'dark' | 'satellite' | 'toner';

interface MemberLocation {
  userId: string;
  username: string;
  latitude: number;
  longitude: number;
  capturedAt: string;
  isPrivacyModeActive: boolean;
}

interface MapState {
  style: MapStyle;
  members: MemberLocation[];
  viewState: {
    latitude: number;
    longitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
  };
  setStyle: (style: MapStyle) => void;
  setMembers: (members: MemberLocation[]) => void;
  updateMemberLocation: (userId: string, lat: number, lng: number) => void;
  setViewState: (viewState: Partial<MapState['viewState']>) => void;
}

export const useMapStore = create<MapState>((set) => ({
  style: 'streets',
  members: [],
  viewState: {
    latitude: 40.4168,
    longitude: -3.7038,
    zoom: 13,
    pitch: 45,
    bearing: 0,
  },
  setStyle: (style) => set({ style }),
  setMembers: (members) => set({ members }),
  updateMemberLocation: (userId, latitude, longitude) =>
    set((state) => ({
      members: state.members.map((m) =>
        m.userId === userId ? { ...m, latitude, longitude, capturedAt: new Date().toISOString() } : m,
      ),
    })),
  setViewState: (partial) =>
    set((state) => ({ viewState: { ...state.viewState, ...partial } })),
}));
