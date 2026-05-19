import { describe, it, expect, beforeEach } from 'vitest';
import { useCircleStore } from '../circleStore';

describe('circleStore', () => {
  beforeEach(() => {
    useCircleStore.setState({ circles: [], activeCircleId: null });
  });

  it('should start with empty circles', () => {
    expect(useCircleStore.getState().circles.length).toBe(0);
  });

  it('should add a circle', () => {
    useCircleStore.getState().addCircle({ circleId: '1', name: 'Family', role: 'CIRCLE_ADMIN' });
    expect(useCircleStore.getState().circles.length).toBe(1);
    expect(useCircleStore.getState().circles[0].name).toBe('Family');
  });

  it('should remove a circle', () => {
    useCircleStore.getState().addCircle({ circleId: '1', name: 'Family', role: 'CIRCLE_ADMIN' });
    useCircleStore.getState().removeCircle('1');
    expect(useCircleStore.getState().circles.length).toBe(0);
  });

  it('should set active circle', () => {
    useCircleStore.getState().setActiveCircle('circle-1');
    expect(useCircleStore.getState().activeCircleId).toBe('circle-1');
  });
});
