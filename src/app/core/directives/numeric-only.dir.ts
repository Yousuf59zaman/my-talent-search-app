import { Directive, HostListener, input } from '@angular/core';

@Directive({
  selector: 'input[appNumericOnly]',
  standalone: true
})
export class NumericOnlyDirective {
  isNumericOnly = input(true);
  isDecimalAllowed = input(true);
  minValue = input<number>(0);
  maxValue = input<number>(999999999999);
  isForInputEvent = input(false);
  showMinValueForValidation = input(0);
  minDigitTobeChecked = input(0);
  private allowedKeys: string[] = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
  previousValue = '';

  @HostListener('keypress', ['$event']) 
  onKeyPress(event: KeyboardEvent) {
    if (this.isForInputEvent()) {
      const isValidEntry = (event.keyCode == 8 || event.keyCode == 0) ? null : event.keyCode >= 48 && event.keyCode <= 57
      if (!isValidEntry) {
        return false;
      }
    } else { // For input type text
      if(this.isNumericOnly()) {
        if (this.allowedKeys.indexOf(event.key) !== -1 || !this.isNumericOnly()) {
          return false;
        }
        const pattern = this.isDecimalAllowed() ? /^[0-9\.]$/ : /^[0-9]$/
        if (!event.key.match(pattern)) {
          event.preventDefault();
          return false;
        }
      }
    }
    return true;
  }


  @HostListener('input', ['$event'])
  onInput(event: KeyboardEvent) {
    if (this.isForInputEvent()) {
      const inputElement = event.target as HTMLInputElement;
      const value = +inputElement.value;
      if (!this.isValidRange(event) && this.minDigitTobeChecked() <= inputElement.value.length) {
        inputElement.value = this.showMinValueForValidation() ? this.showMinValueForValidation().toString() : this.previousValue;
      } else {
        if (inputElement.value.startsWith('0') && inputElement.value.length > 1) {
          inputElement.value = inputElement.value.slice(1);
        }
        this.previousValue = inputElement.value;
      }
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');
    const pattern = this.isDecimalAllowed() ? /^[0-9\.]$/ : /^[0-9]$/
    if (!pastedText.match(pattern) && this.isNumericOnly()) {
      event.preventDefault();
    }
  }

  isValidRange(event: Event) {
    if ((this.maxValue() >= +(event.target as HTMLInputElement).value &&  +(event.target as HTMLInputElement).value >= this.minValue())) {
      return true;
    }
    return false;
  } 
}
