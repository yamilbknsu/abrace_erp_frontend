import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import { LoadingIconService } from 'src/app/services/loading-icon.service';
import { BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-vertical-navbar',
  templateUrl: './vertical-navbar.component.html',
  styleUrls: ['./vertical-navbar.component.css']
})
export class VerticalNavbarComponent implements OnInit {

  options = [];
  isLoading: BehaviorSubject<boolean>;

  constructor(private _location: Location, private loadingIconService: LoadingIconService) { }

  ngOnInit(): void {
    this.options = [
      {displayName: 'Propiedades', svgDir: 'assets/icon/casa.svg', route: './propiedades'},
      {displayName: 'Mandantes y Arrendatarios', svgDir: 'assets/icon/carpeta.svg', route: './personas'},
      {displayName: 'Direcciones', svgDir: 'assets/icon/map.svg', route: './direccion'},
      {displayName: 'Acciones', svgDir: 'assets/icon/mediation.svg', route: './acciones'},
      {displayName: 'Informes', svgDir: 'assets/icon/noticias.svg', route: './informes'},
      {displayName: 'Parámetros', svgDir: 'assets/icon/config.svg', route: './parametros'}
    ]

    this.isLoading = this.loadingIconService.getLoadingFlag();
  }

  onBackClicked(){
    this._location.back();
  }

}
