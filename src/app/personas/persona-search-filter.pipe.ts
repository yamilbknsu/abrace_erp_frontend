import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'personaSearch'})
export class personaSearchPipe implements PipeTransform {
  transform(value: any[], searchText?: string): any {
      
      if (!value || !searchText || searchText == "") return value;
      return value.filter(item =>
        (item.nombre.toLowerCase().includes(searchText.toLowerCase())) ||
         item.rut.toLowerCase().includes(searchText.toLowerCase()));
  }
}