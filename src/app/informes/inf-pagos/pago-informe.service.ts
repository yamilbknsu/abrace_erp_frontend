import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AccionesService } from 'src/app/acciones/acciones.service';
import { PropiedadesService } from 'src/app/propiedades/propiedades.service';

@Injectable({
  providedIn: 'root',
})
export class PagoInformeResolverService implements Resolve<any> {
  constructor(private router: Router, private accionesService: AccionesService,
              private propiedadesService: PropiedadesService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    
    return this.accionesService.loadPagosInforme().pipe(
      map(propiedades => this.propiedadesService.joinPropiedadData(propiedades))
    );
  }
}