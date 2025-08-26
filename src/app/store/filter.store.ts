import { signalStore, withState, patchState, withMethods } from '@ngrx/signals';

export interface FilterStoreState {
  totalCvCount: number | null;
  isLoading: boolean;
}

const initialState: FilterStoreState = {
  totalCvCount: 0,
  isLoading: false,
};

export const FilterStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setTotalCvCount: (count: number) => {
      patchState(store, { totalCvCount: count });
    },
  }))
);