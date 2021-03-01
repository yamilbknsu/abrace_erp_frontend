
import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { EMPTY, observable, Observable, of } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { Propiedad } from '../models/Propiedad';
import { PropiedadesService } from './propiedades.service';



@Injectable({
  providedIn: 'root',
})
export class PropiedadesIdResolverService implements Resolve<Propiedad> {
  constructor(private router: Router, private propiedadesService: PropiedadesService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Propiedad> {
    const id = route.queryParams['id'];
    
    if (id == 'new') return of(new Propiedad());

    return this.propiedadesService.getPropiedad(id).pipe(
      take(1),
      mergeMap(propiedad => {
        if (propiedad) {
          return of(propiedad);
        } else { // id not found
          this.router.navigate(['/main-view/propiedades']);
          return EMPTY;
        }
      })
    );
  }
}
