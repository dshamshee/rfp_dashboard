import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SidebarSettings {
  disabled: boolean;
}

interface SidebarStore {
  isOpen: boolean;
  isHover: boolean;
  settings: SidebarSettings;
  toggleOpen: () => void;
  setIsHover: (isHover: boolean) => void;
  setIsOpen: (isOpen: boolean) => void;
  getOpenState: () => boolean;
}

export const useSidebar = create<SidebarStore>()(
  persist(
    (set, get) => ({
      isOpen: true,
      isHover: false,
      settings: { disabled: false },
      toggleOpen: () => {
        set({ isOpen: !get().isOpen });
      },
      setIsHover: (isHover: boolean) => {
        set({ isHover });
      },
      setIsOpen: (isOpen: boolean) => {
        set({ isOpen });
      },
      getOpenState: () => {
        const state = get();
        return state.isOpen || state.isHover;
      },
    }),
    {
      name: "sidebar",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
