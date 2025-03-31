import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const _fees = [{
  name: 'Fast',
  value: 5,
}, {
  name: 'Avg',
  value: 6,
}, {
  name: 'Slow',
  value: 7,
}, {
  name: 'Custom',
  value: 0,
}]

export const useFeeRate = create(
  persist(
    (set, get: any) => ({
      feeIndex: 1,
      fees: _fees,
      feeRate: _fees[1].value,
      set: (params: any) => set(() => ({ ...params })),
    }),
    {
      name: '_fee_rate',
      version: 0.1,
      storage: createJSONStorage(() => localStorage)
    }
  )
);
