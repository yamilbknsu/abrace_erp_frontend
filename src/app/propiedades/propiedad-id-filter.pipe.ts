import { Pipe, PipeTransform } from '@angular/core';
import { Propiedad } from '../models/Propiedad';

@Pipe({name: 'idPropiedad'})
export class idPropiedadPipe implements PipeTransform {
  transform(value: Propiedad[], idEditing?: string): any {
      
      if (!value || !idEditing || idEditing == "0") return value;
      return value.filter(item => item._id == idEditing);
  }
}