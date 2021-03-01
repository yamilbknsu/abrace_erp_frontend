import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';


@Component({
  selector: 'app-vertical-navbar',
  templateUrl: './vertical-navbar.component.html',
  styleUrls: ['./vertical-navbar.component.css']
})
export class VerticalNavbarComponent implements OnInit {

  options = [];

  constructor(private _location: Location) { }

  ngOnInit(): void {
    this.options = [
      {displayName: 'Propiedades', svgDir: 'assets/icon/casa.svg', route: './propiedades'},
      {displayName: 'Personas', svgDir: 'assets/icon/carpeta.svg', route: './personas'},
      {displayName: 'Direcciones', svgDir: 'assets/icon/map.svg', route: './direccion'},
      {displayName: 'Informes', svgDir: 'assets/icon/noticias.svg', route: './informes'},
      {displayName: 'Parametros', svgDir: 'assets/icon/config.svg', route: './parametros'}
    ]
  }

  onBackClicked(){
    this._location.back();
  }

}
