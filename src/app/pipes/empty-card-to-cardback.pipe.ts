import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emptyCardToCardback'
})
export class EmptyCardToCardbackPipe implements PipeTransform {

  transform(value: undefined | string | string[]): string | string[] {
    switch (typeof (value)) {
      case 'undefined':
      case 'string':
        return value ? value : 'cardback';
      default: return value.map(x => x ? x : 'cardback');
    }
  }

}
