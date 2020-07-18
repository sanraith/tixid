import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cardFacedown'
})
export class CardFacedownPipe implements PipeTransform {

  transform(value: string | string[]): string | string[] {
    switch (typeof (value)) {
      case 'string': return 'cardback';
      default: return Array(value.length).fill('cardback');
    }
  }

}
