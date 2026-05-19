import { describe, it, expect, beforeEach } from 'vitest';
import { useMapStore } from '../mapStore';

describe('mapStore', () => {
  beforeEach(() => {
    useMapStore.setState({
      style: 'streets',
      members: [],
      viewState: { latitude: 40.4168, longitude: -3.7038, zoom: 13, pitch: 45, bearing: 0 },
    });
  });

  it('should default to streets style', () => {
    expect(useMapStore.getState().style).toBe('streets');
  });

  it('should change map style', () => {
    useMapStore.getState().setStyle('dark');
    expect(useMapStore.getState().style).toBe('dark');
  });

  it('should set members', () => {
    const members = [
      { userId: '1', username: 'Alice', latitude: 40.4, longitude: -3.7, capturedAt: '2024-01-01', isPrivacyModeActive: false },
    ];
    useMapStore.getState().setMembers(members);
    expect(useMapStore.getState().members.length).toBe(1);
  });

  it('should update a member location', () => {
    useMapStore.getState().setMembers([
      { userId: '1', username: 'Alice', latitude: 40.4, longitude: -3.7, capturedAt: '2024-01-01', isPrivacyModeActive: false },
    ]);
    useMapStore.getState().updateMemberLocation('1', 41.0, -4.0);
    const member = useMapStore.getState().members[0];
    expect(member.latitude).toBe(41.0);
    expect(member.longitude).toBe(-4.0);
  });

  it('should update view state partially', () => {
    useMapStore.getState().setViewState({ zoom: 15, pitch: 60 });
    const vs = useMapStore.getState().viewState;
    expect(vs.zoom).toBe(15);
    expect(vs.pitch).toBe(60);
    expect(vs.latitude).toBe(40.4168); // unchanged
  });
});
