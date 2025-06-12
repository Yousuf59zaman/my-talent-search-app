import { NgClass } from '@angular/common';
import { Component, DestroyRef, ElementRef, inject, OnInit, ViewChild, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { filter } from 'rxjs';

@Component({
  selector: 'app-input-with-search',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule],
  templateUrl: './input-with-search.component.html',
  styleUrl: './input-with-search.component.scss',
})
export class InputWithSearchComponent {
  readonly label = input('');
  readonly placeholder = input('');
  readonly isRequired = input<boolean>(false);
  readonly isDisabled = input<boolean>(false);
  readonly name = input('');
  readonly control = input<FormControl>(new FormControl());
  readonly isIcon = input(false);
  readonly searchBtnLabel = input('');
  readonly maxlength = input<number>(95);
  readonly searchleft = input<boolean>(false);
  readonly onKeyStrokeSearch = input<boolean>(false);
  
  @ViewChild('inpt') inpt!: ElementRef<HTMLInputElement>;
  private destroyRef = inject(DestroyRef);

  onTypeListen = this.control()
    .valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter(
        () => this.onKeyStrokeSearch() && this.control().value !== undefined
      )
    )
    .subscribe((value) => {
      if (!value) {
        this.inpt.nativeElement.value = value;
      }
    });

  onSearchBtnClick(value: string) {
    const control = this.control();
    if (control) {
      control.setValue(value);
    }
  }
}
