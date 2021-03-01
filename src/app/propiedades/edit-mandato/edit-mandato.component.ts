import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { element } from 'protractor';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Mandato } from 'src/app/models/Mandato';
import { Propiedad } from 'src/app/models/Propiedad';
import { ParametrosService } from 'src/app/parametros/parametros.service';
import { QueryService } from 'src/app/services/query.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-edit-mandato',
  templateUrl: './edit-mandato.component.html',
  styleUrls: ['./edit-mandato.component.css']
})
export class EditMandatoComponent implements OnInit {

  mandatos$: BehaviorSubject<Mandato[]> = new BehaviorSubject<Mandato[]>([]);
  propiedad: Propiedad;

  mandatoSelected: Mandato;

  selectedInstruccion: number;
  instruccionesNombres = [];

  formasPago$;

  constructor(private route: ActivatedRoute, private queryService: QueryService,
              private parametrosService: ParametrosService, private _location: Location) { }

  ngOnInit(): void {
    this.route.data.subscribe((data: {propiedad: Propiedad}) => {
    this.propiedad = data.propiedad;

    this.mandatos$.subscribe((mandatos: Mandato[]) => {
      if(!this.mandatoSelected && mandatos.length > 0){
        this.mandatoSelected = {...mandatos[0]};
        
        this.mandatoSelected.fechaInicio = new Date(this.mandatoSelected.fechaInicio);
        if(!this.mandatoSelected.fechaTermino) this.mandatoSelected.fechaTermino = new Date(1970,0,1);
        
        this.mandatoSelected.comisiones.admimpuestoincluido = this.mandatoSelected.comisiones.admimpuestoincluido == 'true';
        this.mandatoSelected.comisiones.contratoimpuestoincluido = this.mandatoSelected.comisiones.contratoimpuestoincluido == 'true';

        //if (this.mandatoSelected.instrucciones.length > 0) this.selectedInstruccion = 0;
        //else this.selectedInstruccion = -1;
        this.selectedInstruccion = -1;

        this.instruccionesNombres = this.mandatoSelected.instrucciones.map(i => i.nombre);
      }
    });

    this.queryService.executeGetQuery('read', 'mandatos', {}, {propiedad: this.propiedad._id})
        .subscribe((mandatos) => this.mandatos$.next(mandatos.sort((a,b) => (new Date(a.fechaInicio) > new Date(b.fechaInicio)) ? -1 : 1)));
    });

    this.parametrosService.loadFormasPagoFromBackend();

    this.formasPago$ = this.parametrosService.formasPago$.pipe(
      map(pagos => pagos.map((pago) => { return {name: pago}}))
    );
  }

  updateInstrucciones(items){
    items.forEach(element => {
      if(this.mandatoSelected.instrucciones.filter(e => e.nombre == element).length == 0){
        this.mandatoSelected.instrucciones.push({nombre: element, detalle: ''})
      }
    });

    this.mandatoSelected.instrucciones.forEach(element => {
      if(!items.includes(element.nombre)){
        const index = this.mandatoSelected.instrucciones.map(e => e.nombre).indexOf(element.nombre);
        if (index > -1) {
          this.mandatoSelected.instrucciones.splice(index, 1);
        }
      }
    });
    
    if(this.selectedInstruccion >= this.mandatoSelected.instrucciones.length){
      this.selectedInstruccion = this.mandatoSelected.instrucciones.length - 1;
    }
  }

  changeInstruccionSelected(number){
    this.selectedInstruccion = number;
  }

   formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [day, month, year].join('/');
  }

  checkFechaTermino(date){
    return date > new Date(1970, 0, 1);
  }

  onBackClicked(){
    this._location.back();
  }
}
