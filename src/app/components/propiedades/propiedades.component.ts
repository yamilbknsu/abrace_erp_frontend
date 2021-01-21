import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PropiedadesService } from 'src/app/services/propiedades.service';
import { QueryService } from 'src/app/services/query.service';

@Component({
  selector: 'app-propiedades',
  templateUrl: './propiedades.component.html',
  styleUrls: ['./propiedades.component.css'],
  host: {
    '(document:click)': 'onClick($event)',
  }
})
export class PropiedadesComponent implements OnInit {

  statusText: string;

  propiedades;
  indexSelected: number;
  indexEditing: number;

  // 0: Propiedad
  // 1: Mandato
  editingProperty: number;

  constructor(private queryService: QueryService, private _eref: ElementRef, private router: Router,
    private route: ActivatedRoute, private propiedadService: PropiedadesService) {
  }

  ngOnInit(): void {
    this.statusText = '';
    this.propiedades = [];
    this.indexSelected = -1;
    this.indexEditing = -1;
    this.editingProperty = 0;

    this.propiedadService.loadAndGetPropiedades().subscribe((data) => this.propiedades = data);
  }


  propiedadesClass(i: number){
    if(this.indexEditing == -1){
      return {'propiedad-item': true, 'selected': this.indexSelected == i}
    }else{
      return {'propiedad-item': true, 'inactive': this.indexEditing != i, 'shadowed':  this.indexEditing == i}
    }
  }

  dotMenuClicked(i: number){
    this.indexSelected = i;
  }

  onClick(event){
    if (!this._eref.nativeElement.contains(event.target)){
      this.indexSelected = -1;
    }
  }

  editPropiedad(i: number){
    this.indexEditing = i;
    this.statusText = '/ Editar';
    //this.router.navigate(['edit'], {relativeTo: this.route, queryParams: { propiedad: this.propiedades[i] } })
  }
}
