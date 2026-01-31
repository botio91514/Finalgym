import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UIState {
    hasSeenOffer: boolean;
    setHasSeenOffer: (seen: boolean) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            hasSeenOffer: false,
            setHasSeenOffer: (seen) => set({ hasSeenOffer: seen }),
        }),
        {
            name: 'ui-storage', // unique name
            storage: createJSONStorage(() => sessionStorage), // Use sessionStorage
        },
    ),
);
