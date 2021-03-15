import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Parametro } from '../models/Parametro';
import { QueryService } from '../services/query.service';
import { ToastService } from '../services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class ParametrosService {

  regiones$: BehaviorSubject<Array<string>> = new BehaviorSubject<Array<string>>([]);
  regionesObject$: BehaviorSubject<Parametro> = new BehaviorSubject<Parametro>(new Parametro());

  formasPago$: BehaviorSubject<Array<string>> = new BehaviorSubject<Array<string>>([]);
  funcionComision$: BehaviorSubject<Array<string>> = new BehaviorSubject<Array<string>>([]);

  constructor(private queryService: QueryService, private router: Router,
              private toastService: ToastService) { }

  loadParametroFromBackend(concept){
    // Get an Observable from the response of the backend and subscribe to it
    return this.queryService.executeGetQuery('read', 'parametros', {}, {concept}).pipe(
      // Catch a Forbidden acces error (return to login).
      catchError(err => {
        if (err.status == 403){
          console.log('Forbidden access');
          this.router.navigate([{ outlets: { primary: 'login' }}], { queryParams: { expired: true } });
        };
        return EMPTY;
      })
    )
    
  }

  loadFormasPagoFromBackend(){
    this.loadParametroFromBackend("formaspago").subscribe(res => {
      this.formasPago$.next(res[0].values[0].attributes.sort())
    });
  }

  loadFormasFuncionComisionFromBackend(){
    this.loadParametroFromBackend("funcioncomision").subscribe(res => {
      this.funcionComision$.next(res[0].values[0].attributes.sort())
    });
  }
  
  loadRegionesFromBackend(){
    this.loadParametroFromBackend("regiones").subscribe(res => {
      this.regionesObject$.next(res[0]);
      this.regiones$.next(res[0].values[0].attributes.sort())
    });
  }

  updateRegiones$(regiones: Array<string>){//: Observable<any>{
    var regionesObjectCopy = {... this.regionesObject$.value};
    regionesObjectCopy.values[0].attributes = regiones;

    // Get an Observable from the response of the backend
    return this.queryService.executePostQuery('update', 'parametros', regionesObjectCopy, {concept: 'regiones'}).pipe(
    
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


}
