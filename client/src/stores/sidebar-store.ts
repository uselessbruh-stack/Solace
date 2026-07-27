import { create } from "zustand";

interface SidebarStore {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  activeCollectionId: string | null;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setMobileOpen: (open: boolean) => void;
  setActiveCollection: (id: string | null) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isCollapsed: false,
  isMobileOpen: false,
  activeCollectionId: null,

  toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setCollapsed: (isCollapsed) => set({ isCollapsed }),
  setMobileOpen: (isMobileOpen) => set({ isMobileOpen }),
  setActiveCollection: (activeCollectionId) => set({ activeCollectionId }),
}));
