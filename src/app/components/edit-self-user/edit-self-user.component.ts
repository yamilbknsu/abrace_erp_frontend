import { Component, OnInit } from '@angular/core';
import { UsersService } from 'src/app/services/users.service';
import { UsuariosService } from 'src/app/usuarios/usuarios.service';

@Component({
  selector: 'app-edit-self-user',
  templateUrl: './edit-self-user.component.html',
  styleUrls: ['./edit-self-user.component.css']
})
export class EditSelfUserComponent implements OnInit {

  _usuario:any = {};

  constructor(private usuariosService: UsuariosService) { }

  ngOnInit(): void {
    this.usuariosService.loadSelfUser()
        .subscribe(user => this._usuario = user);
  }

}
