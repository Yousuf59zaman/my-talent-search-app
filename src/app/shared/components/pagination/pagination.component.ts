import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule, PaginationControlsDirective } from 'ngx-pagination';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [NgxPaginationModule, NgClass,FormsModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent {
  readonly data = input<any[]>([]);
  @Input({ required: true }) page = 1;
  readonly total = input.required<number>();
  readonly id = input.required<string>();
  readonly maxSize = input(5);
  readonly isGoByPageNo = input(true);
  readonly isRightAligned = input(false);
  readonly customClasses = input<string>('');

  @Output() pageChange = new EventEmitter<number>();

  @ViewChild('p') paginationDir!: PaginationControlsDirective;

  onPageChange(number: number) {
    this.pageChange.emit(number);
  }

  goToPage() {
    if (this.page && this.page > 0 && this.page <= this.paginationDir.getLastPage()) {
      this.onPageChange(this.page);
    } else {
      alert('Invalid page number');
    }
  }
}
