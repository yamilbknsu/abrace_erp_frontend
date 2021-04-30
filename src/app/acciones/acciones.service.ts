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

  sortDate = (a, b) => (new Date(a.fechacontrato) > new Date(b.fechacontrato)) ? -1 : 1;
  sortDateReverse = (a, b) => (new Date(a.fechacontrato) > new Date(b.fechacontrato)) ? 1 : -1;

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

  loadPropiedadesPago(params={}){
    return this.queryService.executeGetQuery('read', 'pagopropiedades', {}, params).pipe(  
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

  loadPagosInforme(){
    return this.queryService.executeGetQuery('read', 'infpago', {}, {}).pipe(  
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

  loadLiquidaciones(){
    return this.queryService.executeGetQuery('read', 'liquidaciones', {}, {}).pipe(  
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

  loadBoletasLiquidaciones(propiedad, fecha){
    return this.queryService.executeGetQuery('read', 'boletasliquidacion', {}, {propiedad, fecha}).pipe(  
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

  writeLiquidacion(liquidacion){
    return this.queryService.executePostQuery('write', 'liquidaciones', liquidacion, {}).pipe(  
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

  loadLiquidacionesInforme(){
    return this.queryService.executeGetQuery('read', 'infliquidacion', {}, {}).pipe(  
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

  sortByDate(a,b, reverse=false){
    if(reverse)
      return new Date(a.fecha) > new Date(b.fecha) ? -1 : 1;

    return new Date(a.fecha) > new Date(b.fecha) ? 1 : -1;
  }

  getSortByDate(reverse=false){
    if(reverse)
      return (a,b) => new Date(a.fecha) > new Date(b.fecha) ? -1 : 1;

    return (a,b) => new Date(a.fecha) > new Date(b.fecha) ? 1 : -1;
  }

  loadIngresos(propiedadId){
    return this.queryService.executeGetQuery('read', 'ingresos', {}, {propiedad: propiedadId}).pipe(  
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

  loadEgresos(propiedadId){
    return this.queryService.executeGetQuery('read', 'egresos', {}, {propiedad: propiedadId}).pipe(  
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

  writeEgreso(egreso){
    return this.queryService.executePostQuery('write', 'egresos', egreso,{}).pipe(  
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

  writeIngreso(ingreso){
    return this.queryService.executePostQuery('write', 'ingresos', ingreso, {}).pipe(  
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

  loadReajusteRentas(params={}){
    return this.queryService.executeGetQuery('read', 'reajusterentas', {}, params).pipe(  
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
