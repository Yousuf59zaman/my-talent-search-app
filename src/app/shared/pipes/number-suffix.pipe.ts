import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberSuffix',
  standalone: true
})
export class NumberSuffixPipe implements PipeTransform {
  transform(value: number): string {
    if (value === null || value === undefined) return '0';
    
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'K';
    }
    return value.toString();
  }
}