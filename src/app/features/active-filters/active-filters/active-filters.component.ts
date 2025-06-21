import { Component, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

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
    const filterToRemove = this.filters().find(
      (filter) => filter.id === filterbadge.id
    );
    if (filterToRemove) {
      this.removeFilterBadge.emit(filterToRemove);
    }
  }

  clearAll() {
    this.clearAllFilters.emit();
  }
}
