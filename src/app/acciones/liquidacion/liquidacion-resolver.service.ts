import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PropiedadesService } from 'src/app/propiedades/propiedades.service';
import { AccionesService } from '../acciones.service';

@Injectable({
  providedIn: 'root',
})
export class LiquidacionResolverService implements Resolve<any> {
  constructor(private router: Router, private accionesService: AccionesService,
              private propiedadesService: PropiedadesService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    
    return this.accionesService.loadLiquidaciones().pipe(
      map(propiedades => this.propiedadesService.joinPropiedadData(propiedades))
    );
  }
}