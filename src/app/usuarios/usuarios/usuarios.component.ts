import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UsuariosService } from '../usuarios.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {

  usuarios = new BehaviorSubject<any[]>([]);

  _usuario = {};
  noSelected: boolean = true;
  new: boolean = false;

  constructor(private usuariosService: UsuariosService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.usuariosService.loadUsers();
    this.usuarios = this.usuariosService.getAllUsers();
  }

  selectUser(id){
    this.new = false;
    this._usuario = {...this.usuarios.value?.filter(usuario => usuario?._id == id)?.[0]};

    if(this._usuario) this.noSelected = false;
    else this.noSelected = true;
  }

  newUsuario(){
    this.new = true;
    this.noSelected = false;
    this._usuario = {};
  }
}
