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
  }
}
