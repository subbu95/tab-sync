import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatData',
  standalone: true
})
export class FormatDataPipe implements PipeTransform {

  transform(value: string): string {
    return value.replace(/\s+/g, '').toLowerCase();
  }

}
