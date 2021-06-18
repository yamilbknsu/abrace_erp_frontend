import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { Persona } from '../models/Persona';
import { PersonasService } from '../services/personas.service';

@Injectable({
  providedIn: 'root',
})
export class PersonaIdResolverService implements Resolve<Persona> {
  constructor(private router: Router, private personasService: PersonasService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Persona> {
    const id = route.queryParams['id'];
    const isMandante = route.queryParams['ismandante'] ? (route.queryParams['ismandante'] == "true") : true;

    if (id == 'new') return of(new Persona(isMandante));

    return this.personasService.getPersona(id).pipe(
      take(1),
      mergeMap(persona => {
        if (persona) {
          return of(persona);
        } else {
          this.router.navigate(['/main-view/personas']);
          return EMPTY;
        }
      })
    );
  }
}