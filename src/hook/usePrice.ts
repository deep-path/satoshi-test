import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const usePrice = create(
  persist(
    (set, get: any) => ({
      prices: {},
      set: (params: any) => set(() => ({ ...params })),
    }),
    {
      name: '_price',
      version: 0.1,
      storage: createJSONStorage(() => localStorage)
    }
  )
);
