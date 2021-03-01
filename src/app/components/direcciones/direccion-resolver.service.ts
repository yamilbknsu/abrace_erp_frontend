import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { DireccionesService } from 'src/app/services/direcciones.service';

@Injectable({
  providedIn: 'root',
})
export class DireccionIdResolverService implements Resolve<string> {
  constructor(private router: Router, private direccionesService: DireccionesService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<string> {
    const id = route.queryParams['id'];
    if(!id) return of("");
    else return of(id);
  }
}