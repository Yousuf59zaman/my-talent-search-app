import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortNumber',
  standalone: true
})
export class ShortNumberPipe implements PipeTransform {
  transform(value: number): string {
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M+';
    if (value >= 1_000) return (value / 1_000).toFixed(0) + 'K+';
    return value.toString();
  }
}
