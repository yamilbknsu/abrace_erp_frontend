import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { QueryService } from 'src/app/services/query.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-edit-usuario',
  templateUrl: './edit-usuario.component.html',
  styleUrls: ['./edit-usuario.component.css']
})
export class EditUsuarioComponent implements OnInit {

  @Input() _usuario;
  @Input() self = false;
  @Input() nuevo = false;
  
  new_pass = '';
  new_pass_repeat = '';

  constructor(private route: ActivatedRoute, private queryService: QueryService, private toastService: ToastService,
              private router: Router) { }

  ngOnInit(): void {
  
  }

  reiniciarContrasena(){
    const new_pass = this._usuario.username + (new Date(this._usuario.creationDate)).getMonth() + (new Date(this._usuario.creationDate)).getDate()
    this.toastService.confirmation('¿Estás seguro de reiniciar la contraseña para este usuario?', (event, response) => {
      if(response == 1){
        var usuario = {... this._usuario}
        usuario.password = new_pass;

        this.queryService.executePostQuery('auth', 'user', usuario, {id: this._usuario._id})
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
      .subscribe(data =>
          this.toastService.success(`Operación realizada con éxito.\nContraseña provisoria es: ${new_pass}\nPor favor, ingresa con tu cuenta para cambiarla.`)
        )
      }
    })
  }

  onGuardar(){
    this.queryService.executePostQuery('auth', 'user', this._usuario, {id: this._usuario._id})
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
    .subscribe(data =>
        this.toastService.success('Operación realizada con éxito.\nReiniciar para ver cambios.')
      )
  }

  cambiarContrasena(){
    if(this.new_pass.length < 8) return this.toastService.error('Contraseña nueva muy corta');
    if(this.new_pass !== this.new_pass_repeat) return this.toastService.error('Contraseñas no coinciden');

    this.toastService.confirmation('¿Estás seguro de guardar todos los cambios y cambiar la contraseña?', (event, response)=>{
      if(response == 1){
        var usuario = {... this._usuario}
        usuario.password = this.new_pass;

        this.queryService.executePostQuery('auth', 'user', usuario, {id: this._usuario._id})
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
      .subscribe(data =>
          this.toastService.success(`Operación realizada con éxito.`)
        )
      }
    })
  }

  onCreateUser(){
    this._usuario.permissions = ['read-all', 'write-all', 'update-all', 'delete-all']
    this._usuario.password = this.new_pass;

    this.queryService.executePostQuery('auth', 'register', this._usuario, {})
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
    .subscribe(data =>
        {
          this.toastService.success('Operación realizada con éxito.');
          window.location.reload();
        }
      )
  }

  onDeleteuser(){
    this.toastService.confirmation('¿Estás seguro de eliminar este usuario?', (event, response) => {
      if(response == 1){
        this.queryService.executeDeleteQuery('auth', 'user', {}, {id: this._usuario._id})
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
      .subscribe(data =>{
          this.toastService.success(`Operación realizada con éxito.`);
          window.location.reload();
        }
        )
      }
    })
  }

  logout(){
    this.router.navigate([{ outlets: { primary: 'login' }}], { queryParams: { expired: false } });
  }

  formatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [day, month, year].join('/');
  }

}
