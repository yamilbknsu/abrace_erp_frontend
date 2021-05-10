import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { AccionesService } from '../acciones.service';

@Injectable({
  providedIn: 'root',
})
export class CierresResolverService implements Resolve<any> {
  constructor(private router: Router, private accionesService: AccionesService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return EMPTY;
    //return this.accionesService.loadCierresMes();
  }
}