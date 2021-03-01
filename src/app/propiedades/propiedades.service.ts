import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { QueryService } from 'src/app/services/query.service';
import { Propiedad } from '../models/Propiedad';
import { ToastService } from '../services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class PropiedadesService {

  propiedades$ : BehaviorSubject<Propiedad[]> = new BehaviorSubject<Propiedad[]>([]);

  constructor(private queryService: QueryService, private router: Router, private toastService: ToastService) { }

  getPropiedades$(): BehaviorSubject<Propiedad[]>{
    return this.propiedades$;
  }

  getPropiedad(id){
    return this.getPropiedades$().pipe(
      map(propiedades => propiedades.find(prop => prop._id == id))
    );
  }

  updatePropiedad$(propiedad: Propiedad): Observable<any>{
    // Get an Observable from the response of the backend
    return this.queryService.executePostQuery('update', 'propiedades', this.cleanPropiedad(propiedad), {id: propiedad._id}).pipe(

      // Catch a Forbidden acces error (return to login).
      catchError(err => {
        if (err.status == 403){
          this.toastService.error('No tienes permiso para realizar esta acción.')
        }else{
          console.log(err)
          var message = err.status + ' ';
          if (err.error)
             message += (err.error.details ? err.error.details[0].message: err.error);
          this.toastService.error('Error desconocido. ' + message)

        }
        return EMPTY;
      })
    )
  }

  createPropiedad$(propiedad: Propiedad): Observable<any>{
    // Get an Observable from the response of the backend
    return this.queryService.executePostQuery('write', 'propiedades', this.cleanPropiedad(propiedad), {}).pipe(

      // Catch a Forbidden acces error (return to login).
      catchError(err => {
        if (err.status == 403){
          this.toastService.error('No tienes permiso para realizar esta acción.')
        }else{
          console.log(err)
          var message = err.status + ' ';
          if (err.error)
             message += (err.error.details ? err.error.details[0].message: err.error);
          this.toastService.error('Error desconocido. ' + message)

        }
        return EMPTY;
      })
    )
  }

  loadPropiedadesFromBackend(){
    // Get an Observable from the response of the backend
    this.queryService.executeGetQuery('read', 'propiedades', {}, {}).pipe(
      // Add DireccionStr
      map(data => this.joinPropiedadData(data)),

      // Catch a Forbidden acces error (return to login).
      catchError(err => {
        if (err.status == 403){
          console.log('Forbidden access');
          this.router.navigate([{ outlets: { primary: 'login' }}], { queryParams: { expired: true } });
        };
        return EMPTY;
      })
    )
    // And subscribe to it
    .subscribe(res => this.propiedades$.next(res));
  }

  deletePropiedad$(id){
    // Get an Observable from the response of the backend
    return this.queryService.executeDeleteQuery('delete', 'propiedades', {}, {id}).pipe(

      // Catch a Forbidden acces error (return to login).
      catchError(err => {
        if (err.status == 403){
          this.toastService.error('No tienes permiso para realizar esta acción.')
        }else{
          console.log(err)
          var message = err.status + ' ';
          if (err.error)
             message += (err.error.details ? err.error.details[0].message: err.error);
          this.toastService.error('Error desconocido. ' + message)

        }
        return EMPTY;
      })
    )
  }


  joinPropiedadData(data){
    data.map(prop =>{
      var direccionStr = '';
      
      if(!prop.direccionData) prop.direccionData = {calle: 'Sin definir'};
      if(!prop.mandanteData) prop.mandanteData = {nombre: 'Sin definir', telefonos: [], emails: []};

      direccionStr = (prop.direccionData.calle != undefined ? prop.direccionData.calle:'') + ' ' +
                     (prop.direccionData.numero != undefined ? prop.direccionData.numero:'') + ' ' +
                     (prop.direccionData.depto != undefined ? '#' + prop.direccionData.depto:'') + ' ' +
                     (prop.direccionData.comuna != undefined ? ', ' + prop.direccionData.comuna:'') + ' ' +
                     (prop.direccionData.region != undefined ? ', ' + prop.direccionData.region:'')
                     prop.direccionStr = direccionStr
      
      if (Object.keys(prop.lastcontrato).length !== 0 &&
          (prop.lastcontrato.fechatermino == undefined || prop.lastcontrato.fechatermino > new Date())){
        prop.arrendatario = prop.lastcontrato.arrendatarioData.nombre
      }else{
        prop.arrendatario = '-'
      }
    });

    return data;
  }

  cleanPropiedad(propiedad){
    const { direccionStr, arrendatario, ...result} = propiedad;
    return result;
  }

}


