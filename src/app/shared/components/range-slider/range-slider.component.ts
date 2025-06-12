import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { Options } from '@angular-slider/ngx-slider';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { NumericOnlyDirective } from '../../../core/directives/numeric-only.dir';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-range-slider',
  standalone: true,
  imports: [NgxSliderModule, ReactiveFormsModule, NumericOnlyDirective, NgClass],
  templateUrl: './range-slider.component.html',
  styleUrl: './range-slider.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class RangeSliderComponent {
  readonly control = input.required<UntypedFormControl>();
  readonly label = input<string>('');
  readonly isShowInput = input<boolean>(false);
  readonly customInputClass = input<string>('');
  readonly isTouched = input<boolean>(false);
  options = model<Options>({floor: 0, ceil: 100});

  onMinInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const minValue = Number(value);
    const maxValue = this.control().value[1];
    const floor =this.options().floor || 0;
    if (this.options() && minValue <= maxValue && minValue >= floor) {
      this.control().setValue([minValue, maxValue]);
    }
  }

  onMaxInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const maxValue = Number(value);
    const minValue = this.control().value[0];
    const ceil = this.options().ceil || 100;
    if (maxValue >= minValue && maxValue <= ceil) {
      this.control().setValue([minValue, maxValue]);
    }
  }

  onSliderChange() {
    const ceil = this.options().ceil || 100;
    const floor = this.options().floor || 0;
    const [minValue, maxValue] = this.control().value;
    if (minValue < floor) {
      this.control().setValue([this.options().floor, maxValue]);
    }
    if (maxValue > ceil) {
      this.control().setValue([minValue, this.options().ceil]);
    }
  }

  get isSelected() {
    const value = this.control().value;
    const options = this.options();
    if (!Array.isArray(value) || value.length !== 2) return false;
    return (value[0] !== options.floor || value[1] !== options.ceil);
  }
}
