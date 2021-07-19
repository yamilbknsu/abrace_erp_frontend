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
      map(data => data.map(direccion => ({...direccion, direccionStr: this.getDireccionStr(direccion)})))
    )
    // And subscribe to it
    .subscribe(res => {this.direcciones$.next(res)});
  }

  updateDireccion$(direccion: Direccion): Observable<any>{
    console.log(direccion)
    // Get an Observable from the response of the backend
    return this.queryService.executePostQuery('update', 'direcciones', this.cleanDireccion(direccion), {id: direccion._id})
  }

  createDireccion$(direccion: Direccion): Observable<any>{
    console.log(direccion)
    // Get an Observable from the response of the backend
    return this.queryService.executePostQuery('write', 'direcciones', this.cleanDireccion(direccion), {id: direccion._id})
  }

  deleteDireccion$(id){
    // Get an Observable from the response of the backend
    return this.queryService.executeDeleteQuery('delete', 'direcciones', {}, {id})
  }

  cleanDireccion(direccion){
    const { direccionlStr, ...result} = direccion;
    if(result.numero) result.numero = result.numero.toString();
    return result;
  }
}
