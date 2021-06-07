import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-parametros',
  templateUrl: './parametros.component.html',
  styleUrls: ['./parametros.component.css']
})
export class ParametrosComponent implements OnInit {

  noSelected: boolean = true;

  parametros: Array<object> = [
    {nombre: 'Regiones', path: 'regiones'},
    {nombre: 'Comunas', path: 'comunas'},
    {nombre: 'Bancos', path: 'bancos'}
  ];

  parametrosUser : Array<object> = [
    {nombre: 'IPC y UF', path: 'ipcuf'}
  ];

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.noSelected = !this.route.firstChild;
      }
    });
  }

  ngOnInit(): void {
  }

}
