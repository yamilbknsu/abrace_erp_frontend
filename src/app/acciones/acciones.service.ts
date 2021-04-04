import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { QueryService } from '../services/query.service';
import { ToastService } from '../services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class AccionesService {

  constructor(private queryService: QueryService, private toastService: ToastService, private router: Router) {
  }
  
  loadCierresMes(){
    return this.queryService.executeGetQuery('read', 'cierresmes', {}, {}).pipe(  
        // Catch a Forbidden acces error (return to login).
        catchError(err => {
          if (err.status == 403){
            console.log('Forbidden access');
            this.router.navigate([{ outlets: { primary: 'login' }}], { queryParams: { expired: true } });
          };
          return EMPTY;
        })
      );
  }

  loadContratosCierre(date){
    return this.queryService.executeGetQuery('read', 'contratoscierre', {}, {fecha: date}).pipe(  
        // Catch a Forbidden acces error (return to login).
        catchError(err => {
          if (err.status == 403){
            console.log('Forbidden access');
            this.router.navigate([{ outlets: { primary: 'login' }}], { queryParams: { expired: true } });
          };
          return EMPTY;
        })
      );
  }

  loadPropiedadesPago(){
    return this.queryService.executeGetQuery('read', 'pagopropiedades', {}, {}).pipe(  
        // Catch a Forbidden acces error (return to login).
        catchError(err => {
          if (err.status == 403){
            console.log('Forbidden access');
            this.router.navigate([{ outlets: { primary: 'login' }}], { queryParams: { expired: true } });
          };
          return EMPTY;
        })
      );
  }

  writePago(pago){
    return this.queryService.executePostQuery('write', 'pagos', pago, {}).pipe(  
      // Catch a Forbidden acces error (return to login).
      catchError(err => {
        if (err.status == 403){
          console.log('Forbidden access');
          this.router.navigate([{ outlets: { primary: 'login' }}], { queryParams: { expired: true } });
        };
        return EMPTY;
      })
    );
  }

}
