import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'commaNumber',
  standalone: true
})
export class CommaNumberPipe implements PipeTransform {
  transform(value: number): string {
    return value.toLocaleString();
  }
}
