import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { QueryService } from '../services/query.service';
import { ToastService } from '../services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  usuarios$ = new BehaviorSubject<any[]>([]);

  constructor(private queryService: QueryService, private toastService: ToastService) { }

  loadUsers(){
    this.queryService.executeGetQuery('auth', '', {}, {})
      .pipe(

        // Catch a Forbidden acces error (return to login).
        catchError(err => {
          if (err.status == 403) {
            this.toastService.error('No tienes permiso para realizar esta acción.')
          } else {
            console.log(err)
            var message = err.status + ' ';
            if (err.error)
              message += (err.error.details ? err.error.details[0].message : err.error);
            this.toastService.error('Error desconocido. ' + message)

          }
          return EMPTY;
        })
      )
        .subscribe(usuarios => this.usuarios$.next(usuarios))
  }

  getAllUsers(){
    return this.usuarios$;
  }

  getUser(id){
    return this.getAllUsers().pipe(
      map(usuarios => usuarios.find(prop => prop._id == id))
    );
  }

  loadSelfUser(){
    return this.queryService.executeGetQuery('auth', 'self', {}, {})
      .pipe(

        // Catch a Forbidden acces error (return to login).
        catchError(err => {
          if (err.status == 403) {
            this.toastService.error('No tienes permiso para realizar esta acción.')
          } else {
            console.log(err)
            var message = err.status + ' ';
            if (err.error)
              message += (err.error.details ? err.error.details[0].message : err.error);
            this.toastService.error('Error desconocido. ' + message)

          }
          return EMPTY;
        })
      )
  }
}
