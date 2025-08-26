import { signalStore, withState, patchState, withMethods } from '@ngrx/signals';

export interface FilterStoreState {
  totalCvCount: number | null;
  isLoading: boolean;
  isShortlist: boolean;
  isPurchaseList: boolean;
  shortlistGuidId: string | null;
}

const initialState: FilterStoreState = {
  totalCvCount: 0,
  isLoading: false,
  isShortlist: false,
  isPurchaseList: false,
  shortlistGuidId: null,
};

export const FilterStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setTotalCvCount: (count: number) => {
      patchState(store, { totalCvCount: count });
    },
    setIsShortlist: (isShortlist: boolean) => {
      patchState(store, { isShortlist });
    },
    setShortlistGuidId: (id: string | null) => {
      patchState(store, { shortlistGuidId: id });
    },
    setIsPurchaseList: (isPurchaseList: boolean) => {
      patchState(store, { isPurchaseList });
    }
  }))
);