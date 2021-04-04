import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-informes',
  templateUrl: './informes.component.html',
  styleUrls: ['./informes.component.css']
})
export class InformesComponent implements OnInit {

  statusText: string = '';
  noSelected: boolean = true;

  informes: Array<object> = [
    {nombre: 'Informe de propiedades', path: 'propiedades'},
    {nombre: 'Informe de reajustes', path: 'reajustes'},
    {nombre: 'Comprobante de pago', path: 'pagos'},
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