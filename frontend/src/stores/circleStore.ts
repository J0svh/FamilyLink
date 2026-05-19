import { create } from 'zustand';

interface Circle {
  circleId: string;
  name: string;
  role: string;
}

interface CircleState {
  circles: Circle[];
  activeCircleId: string | null;
  setCircles: (circles: Circle[]) => void;
  setActiveCircle: (circleId: string) => void;
  addCircle: (circle: Circle) => void;
  removeCircle: (circleId: string) => void;
}

export const useCircleStore = create<CircleState>((set) => ({
  circles: [],
  activeCircleId: null,
  setCircles: (circles) => set({ circles }),
  setActiveCircle: (circleId) => set({ activeCircleId: circleId }),
  addCircle: (circle) => set((state) => ({ circles: [...state.circles, circle] })),
  removeCircle: (circleId) =>
    set((state) => ({ circles: state.circles.filter((c) => c.circleId !== circleId) })),
}));
