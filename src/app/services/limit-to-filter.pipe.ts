import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'limitTo'})
export class limitToPipe implements PipeTransform {
  transform(value: any[], args?: string): any {
      
    let limit = args ? parseInt(args, 10) : 10;
    if (value.length > limit) return value.slice(0, limit);
    else return value;
  }
}