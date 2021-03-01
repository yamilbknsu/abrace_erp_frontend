import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Direccion } from '../models/Direccion';
import { QueryService } from './query.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class DireccionesService {

  direcciones$: BehaviorSubject<Direccion[]> = new BehaviorSubject<Direccion[]>([]);

  constructor(private queryService: QueryService, private router: Router,
              private toastService: ToastService) { }

  getDirecciones$(): BehaviorSubject<Direccion[]>{
    return this.direcciones$;
  }

  getDireccionStr(direccionData){
    var direccionStr = '';
    direccionStr = (direccionData.calle != undefined ? direccionData.calle:'') + ' ' +
                   (direccionData.numero != undefined ? direccionData.numero:'') + ' ' +
                   (direccionData.depto != undefined ? '#' + direccionData.depto:'') + ' ' +
                   (direccionData.comuna != undefined ? ', ' + direccionData.comuna:'') + ' ' +
                   (direccionData.ciudad != undefined ? ', ' + direccionData.ciudad:'') + ' ' +
                   (direccionData.region != undefined ? ', ' + direccionData.region:'')
    return direccionStr;
  }

  loadDireccionesFromBackend(){
    // Get an Observable from the response of the backend
    this.queryService.executeGetQuery('read', 'direcciones', {}, {}).pipe(
      // Add DireccionStr
      map(data => data.map(direccion => ({...direccion, direccionStr: this.getDireccionStr(direccion)}))),

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
    .subscribe(res => {this.direcciones$.next(res)});
  }

  updateDireccion$(direccion: Direccion): Observable<any>{
    console.log(direccion)
    // Get an Observable from the response of the backend
    return this.queryService.executePostQuery('update', 'direcciones', this.cleanDireccion(direccion), {id: direccion._id}).pipe(

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

  createDireccion$(direccion: Direccion): Observable<any>{
    console.log(direccion)
    // Get an Observable from the response of the backend
    return this.queryService.executePostQuery('write', 'direcciones', this.cleanDireccion(direccion), {id: direccion._id}).pipe(
      
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

  deleteDireccion$(id){
    // Get an Observable from the response of the backend
    return this.queryService.executeDeleteQuery('delete', 'direcciones', {}, {id}).pipe(

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

  cleanDireccion(direccion){
    const { direccionlStr, ...result} = direccion;
    if(result.numero) result.numero = result.numero.toString();
    return result;
  }
}
