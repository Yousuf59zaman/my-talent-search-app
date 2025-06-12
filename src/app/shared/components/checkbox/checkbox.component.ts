import { NgClass, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, input, model } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxComponent {
  readonly label = input('');
  readonly isRequired = input<boolean>(false);
  readonly isDisabled = input<boolean>(false);
  readonly name = input("");
  readonly labelCss = input("");
  readonly allowLabelClick = input<boolean>(true);
  control = model(new FormControl(false));

  onClickLabel = () => {
    if (this.allowLabelClick()) {
      const val = !this.control().value;
      this.control().setValue(val);
    }
  }

}
