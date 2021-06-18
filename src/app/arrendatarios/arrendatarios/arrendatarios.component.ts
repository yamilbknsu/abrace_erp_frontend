import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-arrendatarios',
  templateUrl: './arrendatarios.component.html',
  styleUrls: ['./arrendatarios.component.css']
})
export class ArrendatariosComponent implements OnInit {

  isArrendatario = true;

  constructor() { }

  ngOnInit(): void {
  }

}
