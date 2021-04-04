import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { Contrato } from '../models/Contrato';
import { PropiedadesService } from './propiedades.service';

@Injectable({
  providedIn: 'root',
})
export class ContratoResolverService implements Resolve<any> {
  constructor(private router: Router, private propiedadService: PropiedadesService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const id = route.queryParams['id'];

    //if (id == 'new') return of({_id: ''});
    if (!id) return of({});

    return this.propiedadService.getContrato(id).pipe(
      take(1),
      mergeMap(persona => {
        if (persona) {
          return of(persona);
        } else {
          this.router.navigate(['/main-view/propiedades']);
          return EMPTY;
        }
      })
    );
  }
}