import { ChangeDetectionStrategy, Component, Input, input, model } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectRadioData } from '../../models/models';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class RadioComponent {

  readonly isRequired = input<boolean>(false);
  readonly isDisabled = input<boolean>(false);
  control = model(new FormControl());
  radioItems = input<SelectRadioData[]>([]);
  isHtmlLabel = input<boolean>(false);
  isHorizontalOption = input<boolean>(true);

  // generate unique IDs for label and id matching
  generateId(item: SelectRadioData): string {
    return `${item.name}-${item.id}`;
  }
}
