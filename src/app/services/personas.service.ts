import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Persona } from '../models/Persona';
import { DireccionesService } from './direcciones.service';
import { QueryService } from './query.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class PersonasService {

  personas$: BehaviorSubject<Persona[]> = new BehaviorSubject<Persona[]>([]);

  constructor(private queryService: QueryService, private router: Router,
              private direccionesService: DireccionesService,
              private toastService: ToastService) { }

  getPersonas(): BehaviorSubject<Persona[]>{
    return this.personas$;
  }

  getPersona(id){
    return this.getPersonas().pipe(
      map(personas => personas.find(persona => persona._id == id))
    );
  }

  updatePersona$(persona: Persona): Observable<any>{
    console.log(persona)
    // Get an Observable from the response of the backend
    return this.queryService.executePostQuery('update', 'personas', this.cleanPersona(persona), {id: persona._id})
  }

  createPersona$(persona: Persona): Observable<any>{
    // Get an Observable from the response of the backend
    return this.queryService.executePostQuery('write', 'personas', this.cleanPersona(persona), {id: persona._id})
  }

  loadPersonasFromBackend(){
    // Get an Observable from the response of the backend
    this.queryService.executeGetQuery('read', 'personas', {}, {}).pipe(
      // Add DireccionStr
      map(data => data.map(persona => {
        if(persona.dirParticularData) persona.dirParticularStr = this.direccionesService.getDireccionStr(persona.dirParticularData);
        return persona}))
    )
    // And subscribe to it
    .subscribe(res => this.personas$.next(res.sort((a,b) => a.nombre > b.nombre ? 1 : -1)));
  }

  deletePersona$(id){
    // Get an Observable from the response of the backend
    return this.queryService.executeDeleteQuery('delete', 'personas', {}, {id})
  }

  cleanPersona(persona){
    const { dirParticularData, dirComercialData, dirParticularStr, dirComercialStr, ...result} = persona;
    return result;
  }
}
