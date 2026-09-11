import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'join',
})
export class JoinPipe implements PipeTransform {
  transform(input: unknown, character = ''): unknown {
    return Array.isArray(input) ? input.join(character) : input;
  }
}
