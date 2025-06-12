import { AfterViewInit, ChangeDetectionStrategy, Component, HostListener, Input, input, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { reinitializePreline } from '../../utils/reinitializePreline';
import { NgClass } from '@angular/common';
import { NumericOnlyDirective } from '../../../core/directives/numeric-only.dir';

export type InputType = 'text' | 'password' | 'email' | 'number';

enum InputStype  {
  error = 'hs-validation-name-error',
  success = 'hs-validation-name-success',
  normal = ''
};

enum InputTypeStype {
  normal = 'block w-full rounded-md border-0 py-1.5 pl-5 pr-6 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-[#008A22] sm:text-sm sm:leading-6',
  error = 'py-3 px-4 block w-full border-red-500 rounded-lg text-sm focus:border-red-500 focus:ring-red-500',
  success = 'py-3 px-4 block w-full border-teal-500 rounded-lg text-sm focus:border-teal-500 focus:ring-teal-500'
}

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [ReactiveFormsModule,NgClass],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NumericOnlyDirective, 
      inputs: ['isDecimalAllowed', 'minValue', 'maxValue', 'isNumericOnly']
    }
  ],
})
export class InputComponent<T> implements AfterViewInit, OnInit {
  readonly placeholder = input('');
  readonly label = input();
  readonly type = input<InputType>('text');
  readonly isRequired = input<boolean>(false);
  readonly isDisabled = input<boolean>(false);
  readonly minValue = input<number>(0);
  readonly maxValue = input<number>(999999999999);
  readonly control = input<FormControl<T>>(new FormControl());
  readonly maxLength = input<number>(150);
  readonly classes = input<string>('');
  readonly validationText = input<string>('');
  readonly isExtraAttempt = input<boolean>(false);
  readonly allowedSpecialChars = input<string[]>([]);
  readonly isCheckSpecialCharsValidation = input<boolean>(false);
  valid = true;

  ngOnInit() {
    this.control().valueChanges.subscribe(value => {
      this.handleValueChange(value);
    });
  }

  onInput(event: Event) {
    if (!this.isCheckSpecialCharsValidation()) {
      return;
    }
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;
    const allowed = this.allowedSpecialChars();
    // Escape special regex characters
    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const allowedPattern = allowed.map(escapeRegExp).join('');
    const regex = new RegExp(`[^a-zA-Z0-9${allowedPattern}]`, 'g');
    const filtered = value.replace(regex, '');
    if (filtered !== value) {
      inputElement.value = filtered;
      // Only set if T is string
      if (typeof this.control().value === 'string' || this.control().value === null) {
        this.control().setValue(filtered as any, { emitEvent: false });
      }
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    if (!this.isCheckSpecialCharsValidation() && this.type() !== 'text') {
      return;
    }
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');
    const allowed = this.allowedSpecialChars();
    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const allowedPattern = allowed.map(escapeRegExp).join('');
    const regex = new RegExp(`[^a-zA-Z0-9${allowedPattern}]`, 'g');
    if (regex.test(pastedText)) {
      event.preventDefault();
    }
  }

  private handleValueChange(value: T): void {
    const numericValue = +value;

    const isRequired = this.isRequired();
    if (!isRequired && (value === null || value === undefined || value === '')) {
      this.control().setErrors(null);
      this.styleClass = InputTypeStype.normal;
      this.name = InputStype.normal;
      this.valid = true;
      return;
    }

    if (isRequired && (!value || (value as string).trim() === '')) {
      this.control().setErrors({ required: true });
      this.styleClass = InputTypeStype.error;
      this.name = InputStype.error;
      this.valid = false;
      return;
    }
    
    if (numericValue > this.maxValue() || numericValue < this.minValue()) {
      this.control().setErrors({ invalid: true });
      this.styleClass = InputTypeStype.error;
      this.name = InputStype.error;
      this.valid = false;
      return;
    }

    this.control().setErrors(null);
    this.styleClass = InputTypeStype.normal;
    this.name = InputStype.normal;
    this.valid = true;
  }
  
  name = InputStype.normal;
  styleClass: string = InputTypeStype.normal;

  ngAfterViewInit(): void {
    reinitializePreline();
  }
}
