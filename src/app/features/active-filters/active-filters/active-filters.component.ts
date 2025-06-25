import { Component, signal, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterStore } from '../../../store/filter.store';

export interface FilterBadge {
  id: string;
  label: string;
  type: string;
  value?: any;
}

@Component({
  selector: 'app-active-filters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './active-filters.component.html',
  styleUrl: './active-filters.component.scss'
})
export class ActiveFiltersComponent {

  filters = signal<FilterBadge[]>([]);
  filterQueryStore = inject(FilterStore);
  
  @Input() set activeFilters(value: FilterBadge[]) {
    if (value) {
      this.filters.set(value);
    } else {
      this.filters.set([]);
    }
  }
  
  @Output() removeFilterBadge = new EventEmitter<FilterBadge>();
  @Output() clearAllFilters = new EventEmitter<void>();

  removeFilter(filterbadge: FilterBadge) {
    let filterToRemove
    if (
      filterbadge.type === 'location' ||
      filterbadge.type === 'expertise' ||
      filterbadge.type === 'skills' ||
      filterbadge.type === 'industries' ||
      filterbadge.type === "institutes"
    ) {
      filterToRemove = this.filters().find(
        (filter) => filter.value.selectId === filterbadge.value.selectId
      );
    } else {
      filterToRemove = this.filters().find(
        (filter) => filter.id === filterbadge.id
      );
    }

    if (filterToRemove && filterToRemove.id === "shortlist") {
      this.filterQueryStore.setIsShortlist(false);
      this.filterQueryStore.setShortlistGuidId(null);
    }
    else if (filterToRemove && filterToRemove.id === "purchaseList") {
      this.filterQueryStore.setIsPurchaseList(false);
    }
    if (filterToRemove) {
      this.removeFilterBadge.emit(filterToRemove);
    }
  }

  clearAll() {
    this.filterQueryStore.setIsShortlist(false);
    this.filterQueryStore.setIsPurchaseList(false);
    this.filterQueryStore.setShortlistGuidId(null);
    this.clearAllFilters.emit();
  }
}
