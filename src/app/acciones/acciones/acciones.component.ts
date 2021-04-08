import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-acciones',
  templateUrl: './acciones.component.html',
  styleUrls: ['./acciones.component.css']
})
export class AccionesComponent implements OnInit {

  acciones: any[] = [
    {nombre: 'Cierre de mes', path: 'cierremes'},
    {nombre: 'Liquidación de arriendo', path: 'liquidacion'},
    {nombre: 'Pago de arriendo', path: 'pagoarriendo'}
  ];

  noSelected: boolean = true;

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
