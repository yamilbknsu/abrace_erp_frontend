import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'direccionSearch'})
export class direccionSearchPipe implements PipeTransform {
  transform(value: any[], searchText?: string): any {
      
      if (!value || !searchText || searchText == "") return value;
      return value.filter(item => (item.direccionStr.toLowerCase().includes(searchText.toLowerCase())));
        //(item.nombre.toLowerCase().includes(searchText.toLowerCase())) ||
        // item.rut.toLowerCase().includes(searchText.toLowerCase()));
  }
}