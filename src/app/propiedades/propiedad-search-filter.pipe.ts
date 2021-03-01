import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'propiedadSearch'})
export class propiedadSearchPipe implements PipeTransform {
  transform(value: any[], searchText?: string): any {
      
      if (!value || !searchText || searchText == "") return value;
      return value.filter(item =>
        (item.uId.toLowerCase().includes(searchText.toLowerCase())) ||
         item.direccionStr.toLowerCase().includes(searchText.toLowerCase()));
  }
}