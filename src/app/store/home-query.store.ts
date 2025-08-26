import { signal } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { SelectItem } from '../shared/models/models';
import { Data } from '../features/saved-search/model/allCategory.model';

export type HomeFilterForm = {
    keyWords?: string | null,
    age?: number[],
    eduInstitute?: SelectItem[] | null,
    eduSubject?: SelectItem[] | null,
    salary?: number[],
    expRange?: number[],
    industryType?: SelectItem[] | null,
    category?: {type: 'category' | 'recent' | 'immediate' | 'star', category: Data}
}

export interface IHomeQueryStore {
  filters: HomeFilterForm;
  isLoading: boolean;
}

const initialState: IHomeQueryStore | null = null;

export const HomeQueryStore = signalStore(
    { providedIn: 'root' },
    withState(() => ({
      filter: initialState as IHomeQueryStore | null
    })),
    withMethods((store) => ({
        setFilter(formData: HomeFilterForm): void {
            patchState(store, () => ({ filter: {filters: formData, isLoading: false} }));
        },
        clearFilter(): void {
            patchState(store, (state) => ({ filter: null }));
        },
    }))
);