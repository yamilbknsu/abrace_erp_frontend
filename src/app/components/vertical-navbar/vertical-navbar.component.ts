import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import { LoadingIconService } from 'src/app/services/loading-icon.service';
import { BehaviorSubject } from 'rxjs';
import { UsersService } from 'src/app/services/users.service';


@Component({
  selector: 'app-vertical-navbar',
  templateUrl: './vertical-navbar.component.html',
  styleUrls: ['./vertical-navbar.component.css']
})
export class VerticalNavbarComponent implements OnInit {

  options = [];
  isLoading: BehaviorSubject<boolean>;
  cierremes_warning: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  reajustes_warning: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);

  constructor(private _location: Location, private loadingIconService: LoadingIconService,
              private userService: UsersService) { }

  ngOnInit(): void {
    this.options = [
      {displayName: 'Propiedades', svgDir: './assets/icon/casa.svg', route: './propiedades'},
      {displayName: 'Mandantes', svgDir: 'assets/icon/carpeta.svg', route: './personas'},
      {displayName: 'Arrendatarios y Aval', svgDir: 'assets/icon/carpeta.svg', route: './arrendatarios'},
      {displayName: 'Direcciones', svgDir: 'assets/icon/map.svg', route: './direccion'},
      {displayName: 'Acciones', svgDir: 'assets/icon/mediation.svg', route: './acciones'},
      {displayName: 'Informes', svgDir: 'assets/icon/noticias.svg', route: './informes'},
      {displayName: 'Parámetros', svgDir: 'assets/icon/config.svg', route: './parametros'}
    ]

    if(this.userService.getPermissions()?.includes('admin'))
      this.options = this.options.concat({displayName: 'Usuarios', svgDir: 'assets/icon/usuario.svg', route: './usuarios'})

    this.isLoading = this.loadingIconService.getLoadingFlag();
    this.cierremes_warning = this.loadingIconService.warning_cierremes;
    this.reajustes_warning = this.loadingIconService.warning_reajustes;
  }

  onBackClicked(){
    this._location.back();
  }

}
