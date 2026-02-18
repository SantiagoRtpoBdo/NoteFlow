import { create } from "zustand";

interface SidebarStore {
  isOpen: boolean;
  isResizing: boolean;
  width: number;
  toggle: () => void;
  open: () => void;
  close: () => void;
  setWidth: (width: number) => void;
  setIsResizing: (isResizing: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: true,
  isResizing: false,
  width: 280,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setWidth: (width: number) => set({ width }),
  setIsResizing: (isResizing: boolean) => set({ isResizing }),
}));
